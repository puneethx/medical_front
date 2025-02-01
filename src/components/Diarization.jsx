import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InputMic from "./InputMic"
import UploadFile from "./UploadFile"
import { Link } from 'react-router-dom'

const Diarization = () => {
    const [audioBlob, setAudioBlob] = useState(null)
    const [diarizedText, setDiarizedText] = useState([])
    const [isUploading, setIsUploading] = useState(false)

    const displayMessagesWithDelay = async (messages) => {
        setDiarizedText([]);
        for (let i = 0; i < messages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDiarizedText(prev => [...prev, messages[i]]);
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return

        setIsUploading(true);
        setDiarizedText([]);
        
        try {
            const formData = new FormData()
            formData.append("file", audioBlob, "audio.wav")
            const response = await fetch('https://medify-ai-backend-g62x.onrender.com/doc-pat-transcribe', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            await displayMessagesWithDelay(data.text);
        } catch (error) {
            console.error("Upload failed:", error)
            setDiarizedText([{ speaker: 1, text: "Error: Failed to process audio" }])
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="container mx-auto p-4 bg-[#f3f0ff] text-black font-poppins">
            <Card className="mt-10 w-full max-w-2xl mx-auto rounded-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-600 text-center">Medify AI - Diarization</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="microphone" className="w-full">
                        <TabsList className="bg-[#f9f7ff] grid w-full grid-cols-2">
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
                        className="w-full bg-[#aa95d1] text-white hover:bg-purple-300"
                    >
                        {isUploading ? "Processing..." : "Start Diarization"}
                    </Button>
                    {diarizedText.length > 0 && (
                        <div className="bg-[#f9f7ff] w-full p-8 rounded-md">
                            <h3 className="font-semibold mb-4">Diarized Transcripts:</h3>
                            <div className="space-y-4">
                                {diarizedText.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.speaker === 1 ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-4 rounded-lg ${
                                                message.speaker === 1
                                                    ? 'bg-[#aa95d1] text-white rounded-tl-none'
                                                    : 'bg-white text-black rounded-tr-none'
                                            }`}
                                        >
                                            <p className="text-sm mb-1 opacity-75">
                                                Speaker {message.speaker}
                                            </p>
                                            <p>{message.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>
            <Link 
                to="/" 
                className="fixed bottom-8 right-8 bg-[#aa95d1] text-white px-6 py-3 rounded-full hover:bg-purple-300 shadow-lg transition-all duration-300 ease-in-out"
            >
                Back to Transcription
            </Link>
        </div>
    )
}

export default Diarization 