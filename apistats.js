document.addEventListener('DOMContentLoaded', function () {
    console.log('Event handler is running.'); 
    const searchForm = document.getElementById('search-form');
    const addressInput = document.getElementById('address');
    const table = document.getElementById('blockchain-data');

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const address = addressInput.value.trim();

        // Check if the address is valid (add validation logic here if needed)
        if (address === '') {
            alert('Please enter a valid Tezos address.');
            return;
        }

        // Use backticks for template literals
        // Replace 'your_api_url' with the actual API endpoint using `${}` for the variable
        fetch(`https://api.tzstats.com/explorer/account/${address}/operations?limit=100&order=desc`)
            .then(response => response.json())
            .then(data => {
                // Clear the previous table data
                console.log(data);
                table.innerHTML = '';

                if (Array.isArray(data)) {
                    data.forEach(item => {
                        const row = table.insertRow();
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);// Add more cells as needed for other fields

                        // Populate the table cells with data from the API
                        cell1.textContent = item.hash;
                        cell2.textContent = item.type;
                        cell3.textContent = item.fee;
                        cell4.textContent = item.value;
                        // Populate other cells here based on your data

                        // You can access other fields in a similar manner
                    });
                } else {
                    // Handle the case where the API response is not an array
                    console.error('API response is not an array:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
});
