// reusable error messages
const spareErrorMsg = 'Encountered a / in an unexpected spot'
const strikeErrorMsg = 'Encountered a X in an unexpected spot'
const scoreErrorMsg = 'Encountered a frame with too big of a score'

// function to calculate the frame scores for a bowling game based on the given rolls
// input rolls is an array of strings with values of 0-9 or / or X
// output is an array of numbers with null values for incomplete frames where the value 
// is the score for a frame. Note that this is not the cummulative score of the frames
function caclulateFrameScores(rolls) {
    let scoresByFrame = []
    let currentFrameScore = 0
    let roll = 0
    
    // loop until we are either out of roles or we have scored 10 frames. 
    // This will iterate over the rolls one time. In the case of a strike or spare some elements are read more than once
    // but the worst case is all strikes which is roughly 3 * number of rolls reads from the array.
    // The time complexity would be O(N) where N is the number of rolls 
    while (roll < rolls.length && scoresByFrame.length < 10) {
        // The idea is that every time we are at the top of the loop we are at the start of a frame to be calculated
        if ('X' == rolls[roll]) {
            // Strike logic...          
            // save score and advance to the next frame. 
            scoresByFrame.push(calculateStrikeScore(roll, rolls))
            currentFrameScore = 0
            roll++
        } 
        else {
            // should be a number
            if (rolls[roll] == '/') {
                // the first roll of a frame cant be a spare
                throw new Error(spareErrorMsg)
            }
            if (roll + 1 >= rolls.length) {
                // incomplete frame. push null and skip further logic for this cycle
                scoresByFrame.push(null)
                roll++
                continue
            }
            currentFrameScore += parseInt(rolls[roll])
            let nextRoll = rolls[roll + 1]
            if (nextRoll == '/') {
                // spare logic
                currentFrameScore = calculateSpareScore(roll + 1, rolls)
            } else if (nextRoll == 'X') { // the second roll of a frame cant be a strike
                throw new Error(strikeErrorMsg)
            } 
            else {
                // an open frame. Just add the two rolls together
                currentFrameScore += parseInt(nextRoll)
                if (currentFrameScore >= 10) { // a 10 would have been a spare and you can't go over 10
                    throw new Error(scoreErrorMsg)
                }
            }
            scoresByFrame.push(currentFrameScore)
            currentFrameScore = 0
            roll += 2 // we already added the next roll so move the pointer ahead to the start of the next frame
        }
    }
    return scoresByFrame
}

// function to calculate the score of a strike which is 10 + the next two rolls. 
function calculateStrikeScore(currentRoll, rolls) {
    if (currentRoll + 2 >= rolls.length) {
        // not enough rolls left to calculate the frame. return a null
        return null
    }
    let strikeScore = 10 // strike is worth 10 + the next two rolls
    let nextRoll = rolls[currentRoll + 1]
    if (nextRoll == '/') {
        // next roll after a strike cant be a spare
        throw new Error(spareErrorMsg)
    } else if (nextRoll == 'X') {
        // if it was another strike the value is 20
        strikeScore = 20
    } else {
        strikeScore += parseInt(nextRoll)
    }
    let nextNextRoll = rolls[currentRoll + 2]
    if (nextNextRoll == '/') {
        if (strikeScore == 20) { // XX/ is not valid
            throw new Error(spareErrorMsg)
        }
        // strike followed by a spare is 20
        strikeScore = 20
    } else if (nextNextRoll == 'X') {
        if (strikeScore != 20) {
            // the only way the second value can be a strike is if the first one was too
            throw new Error(strikeErrorMsg)
        }
        strikeScore = 30 // XXX is 30
    } else {
        strikeScore += parseInt(nextNextRoll)
    }
    if (strikeScore > 30) {
        throw new Error(scoreErrorMsg)
    }
    return strikeScore
}

// function to calculate the score of a spare frame which is 10 + the next roll
function calculateSpareScore(currentRoll, rolls) {
    let spareScore = 10
    if (currentRoll + 1 >= rolls.length) {
        // incomplete frame. return null
        return null
    }
    let nextRoll = rolls[currentRoll + 1]
    if (nextRoll == '/') { // cant have a spare followed by a spare without a number in between
        throw new Error(spareErrorMsg)
    } else if (nextRoll == 'X') {
        spareScore = 20 // spare + strike is 20 
    } else {
        spareScore += parseInt(nextRoll)
        if (spareScore > 20) { // spares cant score over 20
            throw new Error(scoreErrorMsg)
        }
    }
    return spareScore
}

// test function that takes an input array and the expected output either an array of nums or an error message
function test(input, expectedOutput) {
    console.log(`input is ${JSON.stringify(input)}`)
    console.log(`expected output is ${JSON.stringify(expectedOutput)}`)
    try {
        let output = caclulateFrameScores(input)
        console.log(`output is ${JSON.stringify(output)}`)
        console.log(`passed: ${JSON.stringify(expectedOutput) == JSON.stringify(output)}`)
    } catch (e) {
        console.log(`output is ${e.message}`)
        console.log(`passed: ${expectedOutput == e.message}`)
    }
    console.log(`---------------`)
}

caclulateFrameScores(['1', '2','3'])

// Empty list shouldn't blow up
test([],[])
// One number should return an array with one null entry
test(['1'], [null])
// Two numbers should return an array with 1 entry that is the sum of the two numbers
test(['1', '2'], [3])
// full game with no spares or strikes. Kind of like when I go bowling :)
test(['1', '8', '3', '3', '0', '0', '7', '2', '6', '1', '0', '5', '1', '0', '2', '4', '7', '1', '1', '2'], [9, 6, 0, 9, 7, 5, 1, 6, 8, 3])
// perfect game!
test(['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'], [30, 30, 30, 30, 30, 30, 30, 30, 30, 30])
// nearly perfect game
test(['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', '9'], [30, 30, 30, 30, 30, 30, 30, 30, 30, 29])
// nearly perfect game spare edition
test(['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', '9', '/'], [30, 30, 30, 30, 30, 30, 30, 30, 29, 20])
// incomplete strike leads to 2 nulls
test(['1', '2', 'X', '3'], [3, null, null])
// incomplete spare leads to a null
test(['2', '3', '6', '/'], [5, null])
// spare followed by a 5 gets 15
test(['1', '/', '5', '3'], [15, 8])
// spare followed by a strixe gets 20
test(['1', '/', 'X'], [20, null])
// invalid spare to start gives error
test(['/'], spareErrorMsg)
// invalid strike gives error
test(['1', 'X'], strikeErrorMsg)
// invalid score gives error
test(['9', '9'], scoreErrorMsg)
// back to back / is invalid
test(['3', '/', '/'], spareErrorMsg)
// spare over 20 is invalid
test(['3', '/', '11'], scoreErrorMsg)