import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadAudio } from "./actions"
import InputMic from "./components/InputMic"
import UploadFile from "./components/UploadFile"

const AudioTranscription = () => {
    const [audioBlob, setAudioBlob] = useState(null)
    const [transcription, setTranscription] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const handleUpload = async () => {
        if (!audioBlob) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("audio", audioBlob)
            const result = await uploadAudio(formData)
            setTranscription(result.text)
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setIsUploading(false)
        }
    }
    return (
        <div className="container mx-auto p-4 bg-white text-black font-sans">
            <Card className="w-full max-w-2xl mx-auto border-black rounded-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Audio Transcription</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="microphone" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="microphone" className="text-black">
                                Microphone
                            </TabsTrigger>
                            <TabsTrigger value="file" className="text-black">
                                File Upload
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="microphone">
                            <InputMic onAudioCapture={setAudioBlob} />
                        </TabsContent>
                        <TabsContent value="file">
                            <UploadFile onFileSelect={setAudioBlob} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col items-center gap-4">
                    <Button
                        onClick={handleUpload}
                        disabled={!audioBlob || isUploading}
                        variant="secondary"
                        className="w-full !bg-black text-white hover:bg-gray-800"
                    >
                        {isUploading ? "Uploading..." : "Upload Audio"}
                    </Button>
                    {transcription && (
                        <div className="w-full p-4 bg-gray-100 rounded-md">
                            <h3 className="font-semibold mb-2">Transcription:</h3>
                            <p>{transcription}</p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default AudioTranscription