export async function checkCharacter(puzzleIdx, x, y, playerId) {
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puzzleIdx, x, y, playerId }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        const { charFound } = await res.json();
        return charFound
    } catch (err) {
        console.error("Fetch error: ", err);
        alert("Network issue - please try again");
    }
}
