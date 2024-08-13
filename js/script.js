document.addEventListener('DOMContentLoaded', () => {
    // Chart Initialization
    const chart = document.querySelector('#chart').getContext('2d');
    
    new Chart(chart, {
        type: 'line',
        data: {
            labels: [
                '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
            datasets: [
                {
                    label: 'NVDC34',
                    data: [13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36, 13.36],
                    borderColor: 'green',
                    borderWidth: 2
                },
                {
                    label: 'AAPL34',
                    data: [61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20, 61.20],
                    borderColor: 'blue',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,

            scales: {
                y: {
                    ticks: {
                        stepSize: 2
                    }
                }
            }

        }
    });

    // Sidebar Toggle Functionality
    const closeBtn = document.querySelector('#close-btn');
    const sidebar = document.querySelector('aside');

    closeBtn.addEventListener('click', () => {
        sidebar.style.display = 'none';
    });


    // Date and Time Update
    function updateDateTime() {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('default', { month: 'short' });
        const year = now.getFullYear();
        const formattedDate = `${day} ${month}, ${year}`;
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedTime = `${hours % 12 || 12}:${minutes}:${seconds}${ampm}`;

        const dateTimeElements = document.querySelectorAll('.date-time');
        dateTimeElements.forEach(dateTimeElement => {
            dateTimeElement.querySelector('p').textContent = formattedDate;
            dateTimeElement.querySelector('small').textContent = formattedTime;
        });
    }

    updateDateTime();
    setInterval(updateDateTime, 100); // Update every minute

    // Update Amount Comparison
    function updateAmountComparison() {
        const predefinedValues = {
            'Apple': 474.56,
            'Nvidia': 252.20
        };

        const investments = document.querySelectorAll('.investment');
        investments.forEach(investment => {
            const companyName = investment.querySelector('h4').textContent;
            const amountElement = investment.querySelector('.amount h4');
            const amountValue = parseFloat(amountElement.textContent.replace('$', '').replace(',', '.'));

            const predefinedValue = predefinedValues[companyName];
            if (predefinedValue) {
                const percentageChange = ((amountValue - predefinedValue) / predefinedValue) * 100;
                const smallElement = investment.querySelector('.amount small');
                smallElement.textContent = `${percentageChange.toFixed(2)}%`;
                if (percentageChange > 0) {
                    smallElement.classList.remove('danger');
                    smallElement.classList.add('success');
                } else {
                    smallElement.classList.remove('success');
                    smallElement.classList.add('danger');
                }
            }
        });
    }

    updateAmountComparison();
    setInterval(updateAmountComparison, 100); // Update every minute

    // Update the Investimentos section
    function updateInvestimentos() {
        const expectedAppleValue = 474.56;
        const expectedNvidiaValue = 252.20;
        const taxas = 0.21
        const expectedTotalValue = expectedAppleValue + expectedNvidiaValue + taxas;

        const appleAmountElement = document.querySelector('#appleAmount');
        const nvidiaAmountElement = document.querySelector('#nvidiaAmount');

        if (appleAmountElement && nvidiaAmountElement) {
            const appleAmount = parseFloat(appleAmountElement.textContent.replace('$', '').replace(',', '.'));
            const nvidiaAmount = parseFloat(nvidiaAmountElement.textContent.replace('$', '').replace(',', '.'));

            const actualTotalValue = appleAmount + nvidiaAmount;
            const percentageChange = ((actualTotalValue - expectedTotalValue) / expectedTotalValue) * 100;

            const investmentsTotalElement = document.querySelector('#investmentsTotal');
            const investmentsChangeElement = document.querySelector('#investmentsChange');
            const investmentsOriginalElement = document.querySelector('#investmentsOriginal');

            if (investmentsTotalElement && investmentsChangeElement && investmentsOriginalElement) {
                investmentsTotalElement.textContent = `$${actualTotalValue.toFixed(2)}`;
                investmentsChangeElement.textContent = `${percentageChange.toFixed(2)}%`;
                investmentsOriginalElement.textContent = `$${expectedTotalValue.toFixed(2)}`
                if (percentageChange > 0) {
                    investmentsChangeElement.classList.remove('danger');
                    investmentsChangeElement.classList.add('success');
                } else {
                    investmentsChangeElement.classList.remove('success');
                    investmentsChangeElement.classList.add('danger');
                }
            }
        }
    }

    updateInvestimentos();
    setInterval(updateInvestimentos, 100); // Update every minute








    // Replace with your API key
    const apiKey = 'qj4R3XWFkeTZKSzqHvkqBM';

    // API endpoints with the API key inserted
    const apiUrl1 = `https://brapi.dev/api/quote/NVDC34?token=${apiKey}`;
    const apiUrl2 = `https://brapi.dev/api/quote/AAPL34?token=${apiKey}`;

    // Function to fetch data from an API endpoint and update the webpage
    async function fetchData(apiUrl, elementId, multiplier) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const regularMarketPrice = data.results[0].regularMarketPrice;
            const adjustedPrice = (regularMarketPrice * multiplier).toFixed(2);
            
            document.getElementById(elementId).textContent = `$${adjustedPrice}`;
            return parseFloat(adjustedPrice.replace('$', '')); // Return the numeric value for calculations
        } catch (error) {
            console.error(`Error fetching data from ${apiUrl}:`, error);
            document.getElementById(elementId).textContent = 'Error loading data.';
            return 0; // Return 0 in case of an error for the calculation
        }
    }

    // Function to update earningsText based on the fetched data and investmentsTotal
    async function updateEarnings() {
        // Fetch data from both APIs and get the numeric values
        const nvidiaPrice = await fetchData(apiUrl1, 'nvidiaAmount', 20);
        const applePrice = await fetchData(apiUrl2, 'appleAmount', 8);
    
        // Get the expected values
        const expectedAppleValue = 474.56;
        const expectedNvidiaValue = 252.20;
    
        // Calculate earnings
        const totalExpected = expectedAppleValue + expectedNvidiaValue + 0.21;
        const totalActual = nvidiaPrice + applePrice;
        const earnings = (totalActual - totalExpected).toFixed(2);
    
    
        // Update the earningsText
        document.getElementById('earningsText').textContent = `$${earnings}`;
    }
    

    // Call the function to update earnings when the page loads
    window.onload = function() {
        updateEarnings();
        // Set up the interval to fetch data and update earnings every 3 minutes (180,000 milliseconds)
        setInterval(updateEarnings, 120000);
    };






});













  