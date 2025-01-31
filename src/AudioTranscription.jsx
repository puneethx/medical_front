import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadAudio } from "./actions"
import InputMic from "./components/InputMic"
import UploadFile from "./components/UploadFile"
import ReactMarkdown from 'react-markdown'

const AudioTranscription = () => {
    const [audioBlob, setAudioBlob] = useState(null)
    const [transcribedText, setTranscribedText] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [suggestion, setSuggestion] = useState([])
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)

    const displayWordsWithDelay = async (text, setter) => {
        const words = text.split(' ');
        setter([]);
        
        for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            setter(prev => [...prev, words[i]]);
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return

        setIsUploading(true);
        setTranscribedText([]);
        setSuggestion([]); // Change to empty array
        
        try {
            const formData = new FormData()
            formData.append("file", audioBlob, "audio.wav")
            const response = await fetch('https://medify-ai-backend-1.onrender.com/single-speaker-transcribe', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            await displayWordsWithDelay(data.text, setTranscribedText);
        } catch (error) {
            console.error("Upload failed:", error)
            setTranscribedText(["Error: Failed to transcribe audio"])
        } finally {
            setIsUploading(false)
        }
    }

    const handleGenerateSuggestions = async () => {
        if (transcribedText.length === 0) return;

        setIsGeneratingSuggestion(true);
        try {
            const prompt = transcribedText.join(' ');
            const response = await fetch(
                `https://medify-ai-backend-1.onrender.com/med-suggest?prompt=${encodeURIComponent(prompt)}`,
                { method: 'POST' }
            );
            
            const data = await response.json();
            await displayWordsWithDelay(data.message, setSuggestion);
        } catch (error) {
            console.error("Failed to generate suggestions:", error);
            setSuggestion(["Error: Failed to generate medical suggestions"]);
        } finally {
            setIsGeneratingSuggestion(false);
        }
    };

    return (
        <div className="container mx-auto p-4 bg-[#f3f0ff] text-black font-poppins">
            <Card className="mt-10 w-full max-w-2xl mx-auto rounded-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-600 text-center">Medify AI</CardTitle>
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
                        {isUploading ? "Transcribing..." : "Transcribe Audio"}
                    </Button>
                    {transcribedText.length > 0 && (
                        <>
                            <div className="bg-[#f9f7ff] w-full p-8 bg-gray-100 rounded-md">
                                <h3 className="font-semibold mb-2">Transcription:</h3>
                                <p>{transcribedText.join(' ')}</p>
                            </div>
                            <Button
                                onClick={handleGenerateSuggestions}
                                disabled={isGeneratingSuggestion}
                                variant="secondary"
                                className="w-full bg-[#aa95d1] text-white hover:bg-purple-300"
                            >
                                {isGeneratingSuggestion ? "Generating..." : "Generate Suggestions"}
                            </Button>
                        </>
                    )}
                    {suggestion.length > 0 && (
                        <div className="bg-[#f9f7ff] w-full p-8 bg-gray-100 rounded-md">
                            <h3 className="font-semibold mb-2">Medical Suggestions:</h3>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{suggestion.join(' ')}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default AudioTranscription