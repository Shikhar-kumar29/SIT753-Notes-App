async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Note from Fetch',
                content: 'This is a test'
            })
        });
        const data = await res.json();
        console.log('POST Success:', data);
        
        const getRes = await fetch('http://localhost:5000/api/notes');
        const getData = await getRes.json();
        console.log('GET Success:', getData);
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

test();
