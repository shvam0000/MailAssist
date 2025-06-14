async function getCatFact() {
  try {
    const response = await fetch('https://catfact.ninja/fact');
    const data = await response.json();

    // Update the fact text
    document.getElementById('factText').textContent = data.fact;

    // Update the fact length
    document.getElementById(
      'factLength'
    ).textContent = `Fact length: ${data.length} characters`;
  } catch (error) {
    console.error('Error fetching cat fact:', error);
    document.getElementById('factText').textContent =
      'Sorry, there was an error fetching the cat fact. Please try again.';
    document.getElementById('factLength').textContent = '';
  }
}

// Get a fact when the page loads
document.addEventListener('DOMContentLoaded', getCatFact);
