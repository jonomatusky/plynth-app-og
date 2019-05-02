const censoredWords = [
    'album',
    'cover',
    'vinyl',
    '[vinyl]',
    'usa',
    'import',
    'lp',
    '[lp]',
    'cd',
    '[cd]',
    'soundtrack',
    '(album)',
    '[german import]'
];

const searchCleanup = (search) => {

    let searchArray = search.split(" ")
    const safeArray = []

    searchArray.forEach((word) => {
        if (!censoredWords.includes(word)) {
            safeArray.push(word)
        }
    })

    const hyphenIndex = safeArray.indexOf("-")

    if (hyphenIndex >= 0) {
        safeArray = safeArray.slice(hyphenIndex + 1, safeArray.length)
    }

    const safeSearch = safeArray.join(" ")

    return safeSearch
}

const removeOneWord = (search) => {
    if (searchArray.length > 0) {
        searchArray.pop()
    }
    console.log(searchArray)
}

module.exports = { searchCleanup, removeOneWord }