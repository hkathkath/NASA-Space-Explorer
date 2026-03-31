// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.getElementById('loadButton');
const gallery = document.getElementById('gallery');

// NASA API key (use DEMO_KEY for limited access, or get your own from https://api.nasa.gov/)
const apiKey = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Function to get all dates between start and end dates
function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  
  // Loop through each day in the range and add it to the dates array
  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Function to fetch and display space images for a date range
function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Clear the gallery and show a loading message
  gallery.innerHTML = '<p>Loading space photos...</p>';
  
  // Get all dates in the selected range
  const dates = getDateRange(startDate, endDate);
  
  // Create an array of promises to fetch data for each date
  const fetchPromises = dates.map(date => 
    fetch(`https://api.nasa.gov/planetary/apod?api_key=iOp0usSXnh1r3Z0muj6I83tiVr3DvbNSmmyShU1T&date=${date}`)
      .then(response => response.json())
      .catch(error => {
        console.log(`Error fetching data for ${date}:`, error);
        return null;
      })
  );
  
  // Wait for all fetch requests to complete
  Promise.all(fetchPromises)
    .then(results => {
      // Clear the gallery
      gallery.innerHTML = '';
      
      // Filter out any null results (failed requests)
      const validImages = results.filter(data => data && data.media_type === 'image');
      
      // Check if we found any images
      if (validImages.length === 0) {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
        return;
      }
      
      // Add each image to the gallery
      validImages.forEach(data => {
        // Create a container for each image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-item';
        
        // Create and add the image
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = data.title;
        imageContainer.appendChild(img);
        
        // Create and add the title
        const title = document.createElement('h3');
        title.textContent = data.title;
        imageContainer.appendChild(title);
        
        // Create and add the date
        const date = document.createElement('p');
        date.className = 'image-date';
        date.textContent = `Date: ${data.date}`;
        imageContainer.appendChild(date);
        
        // Add click event to open the modal with full details
        imageContainer.addEventListener('click', () => {
          openModal(data);
        });
        
        // Add the container to the gallery
        gallery.appendChild(imageContainer);
      });
    })
    .catch(error => {
      console.error('Error loading images:', error);
      gallery.innerHTML = '<p>Error loading images. Please try again.</p>';
    });
}

// Function to open the modal with image details
function openModal(imageData) {
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  
  // Fill in the modal with image data
  modalImage.src = imageData.url;
  modalImage.alt = imageData.title;
  modalTitle.textContent = imageData.title;
  modalDate.textContent = `Date: ${imageData.date}`;
  // Display the explanation, or a message if it's not available
  modalExplanation.textContent = imageData.explanation || 'No explanation available for this image.';
  
  // Show the modal
  modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// Get references to modal elements
const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close-button');

// Close modal when close button is clicked
closeButton.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', (event) => {
  // Only close if clicking directly on the modal background, not the content
  if (event.target === modal) {
    closeModal();
  }
});

// Add click event listener to the button
button.addEventListener('click', getSpaceImages);

