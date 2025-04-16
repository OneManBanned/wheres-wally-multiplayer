export async function checkCharacter(puzzleIdx, x, y, playerId) {
    console.log("Sending guess:", { puzzleIdx, x, y, playerId }); 
    try {
        const res = await fetch("/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puzzleIdx, x, y, playerId }),
        });
        if (!res.ok) {
const errorData = await res.json(); // Get server error
            throw new Error(`Server error: ${res.status} - ${errorData.error}`);
        }
        const { charFound } = await res.json();
        return charFound
    } catch (err) {

        console.error("Fetch error: ", err);
        alert("Network issue - please try again");
    }
}
