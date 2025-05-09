export default async function getChats() {
    const chats: any[] = []
    try {
        const response = await fetch(`/api/sessions`, {
            headers: {
                "Content-Type": "application/json",
            },
        })

        const data = await response.json()

        console.log(data)
    } catch (error) {
        console.error(error)
    }
    return chats
}