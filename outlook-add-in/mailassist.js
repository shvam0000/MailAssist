function showLoadingSpinner() {
  console.log('Showing loading spinner');
  document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
  console.log('Hiding loading spinner');
  document.getElementById('loadingSpinner').classList.add('hidden');
}

function showSuccessMessage() {
  console.log('Showing success message');
  document.getElementById('successMessage').classList.remove('hidden');
}

function hideSuccessMessage() {
  console.log('Hiding success message');
  document.getElementById('successMessage').classList.add('hidden');
}

function showErrorMessage(message) {
  console.log('Showing error message:', message);
  const errorText = document.getElementById('errorText');
  errorText.textContent = message;
  document.getElementById('errorMessage').classList.remove('hidden');
}

function hideErrorMessage() {
  console.log('Hiding error message');
  document.getElementById('errorMessage').classList.add('hidden');
}

// Get the current email data from Outlook
async function getCurrentEmail() {
  console.log('Starting getCurrentEmail function');
  try {
    const item = Office.context.mailbox.item;
    console.log('Mailbox item:', item);
    console.log('Body type:', item.body.type);

    return new Promise((resolve, reject) => {
      console.log('Getting email body asynchronously');

      const getBody = (coercionType) => {
        console.log('Attempting to get body with coercion type:', coercionType);
        item.body.getAsync(coercionType, (result) => {
          console.log('getAsync callback received with status:', result.status);
          console.log('Result value type:', typeof result.value);
          console.log(
            'Result value length:',
            result.value ? result.value.length : 0
          );

          if (result.status === Office.AsyncResultStatus.Succeeded) {
            console.log('Successfully retrieved email body');
            console.log(
              'Body preview:',
              result.value.substring(0, 100) + '...'
            );

            const emailData = {
              subject: item.subject || 'No Subject',
              sender: item.from ? item.from.emailAddress : 'Unknown sender',
              recipient:
                item.to && item.to.length > 0
                  ? item.to[0].emailAddress
                  : 'Unknown recipient',
              timestamp: new Date().toISOString(),
              body: result.value,
              messageId: item.internetMessageId,
            };
            console.log('Constructed email data:', emailData);
            resolve(emailData);
          } else {
            console.error(
              'Failed to get email body with coercion type:',
              coercionType
            );
            if (coercionType === Office.CoercionType.Html) {
              console.log('Retrying with Text coercion type');
              getBody(Office.CoercionType.Text);
            } else {
              reject(new Error('Failed to get email body'));
            }
          }
        });
      };

      getBody(Office.CoercionType.Html);
    });
  } catch (error) {
    console.error('Error in getCurrentEmail:', error);
    throw error;
  }
}

// Send email data to the API
async function sendEmailToAPI(emailData) {
  console.log('Starting sendEmailToAPI with data:', emailData);
  try {
    showLoadingSpinner();
    console.log('Making API request to http://127.0.0.1:5000/add-email');
    const response = await fetch(
      'https://athena-addin-4ba193b14103.herokuapp.com/add-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }
    );

    console.log('API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log('API success response:', result);
    return result;
  } catch (error) {
    console.error('Error in sendEmailToAPI:', error);
    throw error;
  } finally {
    hideLoadingSpinner();
  }
}

// Update the UI with email data
function updateEmailList(emailData) {
  console.log('Starting updateEmailList with data:', emailData);
  const emailList = document.getElementById('emailList');
  const template = document.getElementById('emailTemplate');

  const emailItem = template.content.cloneNode(true);

  const updateElement = (selector, content) => {
    const element = emailItem.querySelector(selector);
    if (element) {
      element.textContent = content;
    } else {
      console.warn(`Element not found: ${selector}`);
    }
  };

  updateElement('.email-subject', emailData.subject || 'No Subject');
  updateElement(
    '.email-recipient',
    `To: ${emailData.recipient || 'Unknown recipient'}`
  );
  updateElement(
    '.email-sender',
    `From: ${emailData.sender || 'Unknown sender'}`
  );
  updateElement(
    '.email-timestamp',
    new Date(emailData.timestamp).toLocaleString()
  );

  const bodyPreview = emailData.body
    ? emailData.body
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100) + '...'
    : 'No body content';

  // add Subject to the email item
  updateElement('.email-body-preview', `Subject: ${bodyPreview}`);
  // updateElement('.email-body-preview', bodyPreview);

  const sendButton = emailItem.querySelector('.send-button');
  if (sendButton) {
    sendButton.addEventListener('click', async () => {
      console.log('Send button clicked');
      try {
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
        console.log('Sending email data to API');
        await sendEmailToAPI(emailData);
        sendButton.textContent = 'Sent!';
        sendButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        sendButton.classList.add('bg-green-600');
        showSuccessMessage();
      } catch (error) {
        console.error('Error in send button click handler:', error);
        sendButton.textContent = 'Failed';
        sendButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        sendButton.classList.add('bg-red-600');
        showErrorMessage(
          error.message || 'Failed to process email. Please try again.'
        );
      }
    });
  } else {
    console.warn('Send button not found in template');
  }

  emailList.appendChild(emailItem);
  console.log('Added email item to list');
}

const sendButton = emailItem.querySelector('.send-button');
if (sendButton) {
  sendButton.addEventListener('click', async () => {
    try {
      sendButton.disabled = true;
      sendButton.textContent = 'Saving...';
      await sendEmailToAPI(emailData); // POST to /add-email
      sendButton.textContent = 'Saved!';
      sendButton.classList.remove('bg-blue-600');
      sendButton.classList.add('bg-emerald-700');
      showSuccessMessage();
    } catch (error) {
      console.error('Error saving email:', error);
      sendButton.textContent = 'Failed';
      sendButton.classList.remove('bg-blue-600');
      sendButton.classList.add('bg-red-600');
      showErrorMessage(error.message || 'Failed to save email.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('goToDashboard').addEventListener('click', () => {
    hideSuccessMessage();
  });

  document.getElementById('closeError').addEventListener('click', () => {
    hideErrorMessage();
  });

  // Test Local API button
  const testLocalApiButton = document.getElementById('testLocalApiButton');
  if (testLocalApiButton) {
    testLocalApiButton.addEventListener('click', async () => {
      const resultDiv = document.getElementById('testLocalApiResult');
      resultDiv.textContent = 'Loading...';
      try {
        // Change the URL if your backend is not on 127.0.0.1:5000
        const response = await fetch(
          'https://athena-addin-4ba193b14103.herokuapp.com/fetch-emails'
        );
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        resultDiv.textContent = 'Success! See popup for details.';
        // Show the data in a popup/modal
        showErrorMessage('Fetched emails: ' + JSON.stringify(data, null, 2));
      } catch (error) {
        resultDiv.textContent = '';
        showErrorMessage('Local API test failed: ' + (error.message || error));
      }
    });
  }
});

Office.initialize = function (reason) {
  console.log('Office.initialize called with reason:', reason);
  console.log('Office context:', Office.context);
  console.log('Mailbox:', Office.context.mailbox);

  try {
    if (Office.context.mailbox) {
      console.log('Mailbox context exists');
      loadEmailDetailsAndReport();
    } else {
      console.error('No mailbox context available');
      showErrorMessage('This add-in only works in Outlook');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    showErrorMessage('Failed to initialize add-in: ' + error.message);
  }
};

async function loadEmailDetailsAndReport() {
  console.log('Starting loadEmailDetailsAndReport');
  try {
    const emailData = await getCurrentEmail();
    console.log('Email data loaded:', emailData);
    updateEmailList(emailData);
  } catch (error) {
    console.error('Error in loadEmailDetailsAndReport:', error);
    showErrorMessage('Failed to load email data: ' + error.message);
  }
}

async function summarizeEmail(emailData) {
  showLoadingSpinner();
  try {
    const response = await fetch(
      'https://athena-addin-4ba193b14103.herokuapp.com/process-email-agent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: emailData.body }),
      }
    );

    if (!response.ok) throw new Error('Summarization API failed');
    return await response.json(); // { summary, tags }
  } finally {
    hideLoadingSpinner();
  }
}

const summarizeButton = emailItem.querySelector('.summarize-button');
summarizeButton.addEventListener('click', async () => {
  try {
    summarizeButton.disabled = true;
    summarizeButton.textContent = 'Summarizing...';
    const result = await summarizeEmail(emailData.body);
    summarizeButton.textContent = 'Done!';
    summarizeButton.classList.replace('bg-blue-600', 'bg-green-700');

    document.getElementById('summaryText').textContent = result.summary;
    document.getElementById('summaryTags').textContent =
      'Tags: ' + result.tags.join(', ');
    document.getElementById('summaryModal').classList.remove('hidden');
  } catch (error) {
    summarizeButton.textContent = 'Failed';
    summarizeButton.classList.replace('bg-blue-600', 'bg-red-600');
    showErrorMessage(error.message || 'Failed to summarize email');
  }
});
