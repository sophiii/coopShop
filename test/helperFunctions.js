function expectDiffToBe(newB, oldB, diffB, msg) {
    oldB = new BigNumber(oldB);
    newB = new BigNumber(newB);
    diffB = new BigNumber(diffB);  

    assert(
        oldB.add(diffB).minus(newB).abs().lt(99000),
        msg + ". Expected " + diffB + " but got " + newB.minus(oldB)
    );
}

function expectNumbersEqual(expect, got, msg) {
    expect = new BigNumber(expect);
    got = new BigNumber(got);
    assert(expect.equals(got), msg + ". Expected " + expect + " but got " + got);
}
