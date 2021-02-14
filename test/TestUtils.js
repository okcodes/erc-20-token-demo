/**
 * Asserts that the given function returns a promise that throws using the chai assertion library.
 *
 * The assertion will succeed if calling 'fn' returns a promise that throws an error. The assertion will fail otherwise.
 *
 * @see {@link https://www.chaijs.com/api/assert/#method_throws|Chai Docs} for further information.
 *
 * @param {function(): Promise<any>} fn - Function that returns the promise which will be asserted to throw.
 * @param {RegExp|String} errMsgMatcher - If provided, it also asserts that the error thrown will have a message matching errMsgMatcher.
 * @param {String} msg - Message to display on error.
 * @returns {Promise<void>}
 * @version 1.0.0
 * @author OkCodes <ok@ok.codes>
 */
module.exports = {
  assertThrowsAsync: async (fn, errMsgMatcher, msg = '') => {
    try {
      await fn();
    } catch (error) {
      assert.throws(() => {
        throw error;
      }, error, errMsgMatcher, msg);
      // At this point if assert didn't throw, return to make the assert to pass.
      return;
    }

    // If this point is reached, it means the fn didn't throw so assert should fail.
    assert.fail(`${msg}: expected [Function] to throw an error`);
  }
};
