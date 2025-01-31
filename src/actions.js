"use server"

export async function uploadAudio(formData) {
  // Simulate file processing and transcription
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return a mock transcription
  return { text: "This is a simulated transcription of the uploaded audio file." }
}

