// Add these utility functions at the top of your mailassist.js
function showLoadingSpinner() {
  document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
  document.getElementById('loadingSpinner').classList.add('hidden');
}

function showSuccessMessage() {
  document.getElementById('successMessage').classList.remove('hidden');
}

function hideSuccessMessage() {
  document.getElementById('successMessage').classList.add('hidden');
}

function showErrorMessage(message) {
  const errorText = document.getElementById('errorText');
  errorText.textContent = message;
  document.getElementById('errorMessage').classList.remove('hidden');
}

function hideErrorMessage() {
  document.getElementById('errorMessage').classList.add('hidden');
}

// Function to get the current email data from Outlook
async function getCurrentEmail() {
  try {
    const item = await Office.context.mailbox.item;
    const emailData = {
      subject: item.subject,
      sender: item.sender.emailAddress,
      recipient: item.to[0].emailAddress,
      timestamp: new Date().toISOString(),
      body: item.body.getAsync(Office.CoercionType.Text),
    };
    return emailData;
  } catch (error) {
    console.error('Error getting email data:', error);
    throw error;
  }
}

// Function to send email data to the API
async function sendEmailToAPI(emailData) {
  try {
    showLoadingSpinner();
    const response = await fetch('http://127.0.0.1:5000/add-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending email to API:', error);
    throw error;
  } finally {
    hideLoadingSpinner();
  }
}

// Function to update the UI with email data
function updateEmailList(emailData) {
  const emailList = document.getElementById('emailList');
  const template = document.getElementById('emailTemplate');
  const emailItem = template.content.cloneNode(true);

  // Update email item content
  emailItem.querySelector('.email-subject').textContent = emailData.subject;
  emailItem.querySelector(
    '.email-recipient'
  ).textContent = `To: ${emailData.recipient}`;
  emailItem.querySelector('.email-timestamp').textContent = new Date(
    emailData.timestamp
  ).toLocaleString();

  // Add click handler to the send button
  const sendButton = emailItem.querySelector('.send-button');
  sendButton.addEventListener('click', async () => {
    try {
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';
      await sendEmailToAPI(emailData);
      sendButton.textContent = 'Sent!';
      sendButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      sendButton.classList.add('bg-green-600');
      showSuccessMessage();
    } catch (error) {
      sendButton.textContent = 'Failed';
      sendButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      sendButton.classList.add('bg-red-600');
      showErrorMessage(
        error.message || 'Failed to process email. Please try again.'
      );
    }
  });

  emailList.appendChild(emailItem);
}

// Add event listeners for the modal buttons
document.addEventListener('DOMContentLoaded', () => {
  // Dashboard button click handler
  document.getElementById('goToDashboard').addEventListener('click', () => {
    hideSuccessMessage();
    // Add your dashboard navigation logic here
    // For example: window.location.href = '/dashboard';
  });

  // Error close button click handler
  document.getElementById('closeError').addEventListener('click', () => {
    hideErrorMessage();
  });
});

// Initialize the add-in
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    // Get the current email when the add-in loads
    getCurrentEmail()
      .then((emailData) => {
        updateEmailList(emailData);
      })
      .catch((error) => {
        console.error('Failed to initialize add-in:', error);
        showErrorMessage(
          'Failed to load email data. Please refresh the add-in.'
        );
      });
  }
});
