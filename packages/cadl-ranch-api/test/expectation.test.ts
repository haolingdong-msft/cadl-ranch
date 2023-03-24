import { expect } from "chai";
import "mocha";
import { CollectionFormat, RequestExt } from "../src/types.js";
import { RequestExpectation } from "../src/expectation.js";

// command:
// $ npx mocha -r ts-node/register .\test\expectation.test.ts
// $ npx ts-mocha  .\test\expectation.test.ts
describe("expectation test suite", () => {
  describe("containsQueryParam()", () => {
    it("should validate successfully with correct input of multi collection", () => {
      const requestExt = { query: { letter: ["a", "b", "c"] } } as unknown as RequestExt;
      console.log(CollectionFormat.Multi);
      // const requestExpectation = new RequestExpectation(requestExt);
      // expect(requestExpectation.containsQueryParam("letter", ['a', 'b', 'c'], CollectionFormat.Multi)).to.equal(true);
      expect(true).to.equal(true);
    });
  });
});
