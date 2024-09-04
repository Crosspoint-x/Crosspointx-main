import * as admin from 'firebase-admin';

interface PendingWrite {
  (transaction: admin.firestore.Transaction): Promise<void>;
}

// Define named constants for magic numbers
const BUCKET_SIZE_DIVISOR = 3;
const RANGE_COUNT_INCREMENT = 1;

/**
 * Calculates the bucket range for a given score.
 * @param {number} value The new score.
 * @param {number} min The min of the previous range.
 * @param {number} max The max of the previous range. Must be greater than min.
 * @return {Object<string, number>} Returns an object containing the new min and max.
 */
function calculateBucketRange(value: number, min: number, max: number): { min: number; max: number } {
  if (max <= min) {
    throw new RangeError('Max must be greater than min');
  }
  const bucketSize = Math.floor((max - min) / BUCKET_SIZE_DIVISOR);
  if (bucketSize === 0) {
    throw new RangeError('Bucket size cannot be zero');
  }
  const newMin = Math.min(min, value - bucketSize);
  const newMax = Math.max(max, value + bucketSize);
  return { min: newMin, max: newMax };
}

/**
 * Creates a new document with exact data.
 * @param {admin.firestore.CollectionReference} coll The collection to write to.
 * @param {number} id The user associated with the score.
 * @param {number} value The new score.
 * @param {Object<string, number>} range An object with properties min and max defining the range this score should be in.
 * @return {Promise<admin.firestore.DocumentReference>} The created document reference.
 */
async function createExactDocument(coll: admin.firestore.CollectionReference, id: number, value: number, range: { min: number; max: number }): Promise<admin.firestore.DocumentReference> {
  try {
    const exactData = { id, value, range };
    return coll.add(exactData);
  } catch (error) {
    throw new Error(`Failed to create exact document: ${error.message}`);
  }
}

/**
 * Writes a score to the correct collection.
 * @param {number} id The user associated with the score.
 * @param {number} value The new score.
 * @param {admin.firestore.CollectionReference} coll The collection this value should be written to.
 * @param {Object<string, number>} range An object with properties min and max defining the range this score should be in.
 * @param {admin.firestore.Transaction} transaction The transaction used to ensure consistency during tree updates.
 * @param {Array<PendingWrite>} pendingWrites A series of writes that should occur once all reads within a transaction have completed.
 * @return {Promise<void>} Write error/success is handled via the transaction object.
 */
async function writeScoreToCollection(
  id: number,
  value: number,
  coll: admin.firestore.CollectionReference,
  range: { min: number; max: number },
  transaction: admin.firestore.Transaction,
  pendingWrites: Array<PendingWrite>
): Promise<void> {
  try {
    const newRange = calculateBucketRange(value, range.min, range.max);
    const exactDocRef = await createExactDocument(coll, id, value, newRange);
    pendingWrites.push((transaction) => transaction.set(exactDocRef, { count: RANGE_COUNT_INCREMENT }));
  } catch (error) {
    handleError(error, transaction);
  }
}

/**
 * Handles errors during score writing.
 * @param {Error} error The error that occurred.
 * @param {admin.firestore.Transaction} transaction The transaction to roll back.
 */
function handleError(error: Error, transaction: admin.firestore.Transaction): void {
  console.error('Error writing score to collection:', error);
  transaction.rollback();
}

// Example usage:
// You can use JSX syntax here
const App = () => {
  // Use the functions here
  return <div>Hello World!</div>;
};

export default App;