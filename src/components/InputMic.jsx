"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, RotateCcw } from "lucide-react"


const InputMic = ({ onAudioCapture }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioUrl, setAudioUrl] = useState(null)
    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const audioRef = useRef(null)

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                const url = URL.createObjectURL(blob)
                setAudioUrl(url)
                onAudioCapture(blob)
                chunksRef.current = []
            }
            mediaRecorderRef.current.start()
            setIsRecording(true)
        } catch (error) {
            console.error("Error accessing microphone:", error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const handlePlay = () => {
        audioRef.current?.play()
    }

    const handleReset = () => {
        setAudioUrl(null)
        onAudioCapture(null)
    }
    
    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="w-16 h-16 rounded-full bg-black text-white hover:bg-gray-800"
            >
                {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <p>{isRecording ? "Recording..." : "Click to start recording"}</p>
            {audioUrl && (
                <div className="flex gap-2">
                    <Button onClick={handlePlay} className="bg-black text-white hover:bg-gray-800">
                        <Play className="w-4 h-4 mr-2" /> Play
                    </Button>
                    <Button onClick={handleReset} className="bg-black text-white hover:bg-gray-800">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                </div>
            )}
            <audio ref={audioRef} src={audioUrl} />
        </div>
    )
}

export default InputMic

