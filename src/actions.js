"use server"

export async function uploadAudio(formData) {
  try {
    // Create a new FormData and append the audio as 'file'
    const apiFormData = new FormData();
    const audioBlob = formData.get('audio');
    apiFormData.append('file', audioBlob, 'recording.wav');

    const response = await fetch('https://medify-ai-backend-1.onrender.com/single-speaker-transcribe', {
      method: 'POST',
      body: apiFormData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    // Return only the text without any additional processing
    return { text: data.text || '' };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

