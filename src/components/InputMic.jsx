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
    const streamRef = useRef(null)

    const convertToWav = async (blob) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const wavBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        // Copy the decoded audio data to the new buffer
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            wavBuffer.copyToChannel(audioBuffer.getChannelData(channel), channel);
        }

        // Convert to WAV
        const offlineContext = new OfflineAudioContext(
            wavBuffer.numberOfChannels,
            wavBuffer.length,
            wavBuffer.sampleRate
        );
        const source = offlineContext.createBufferSource();
        source.buffer = wavBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();
        const wavBlob = await new Promise(resolve => {
            const length = renderedBuffer.length * 4;
            const view = new DataView(new ArrayBuffer(44 + length));

            // Write WAV header
            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + length, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, renderedBuffer.numberOfChannels, true);
            view.setUint32(24, renderedBuffer.sampleRate, true);
            view.setUint32(28, renderedBuffer.sampleRate * 4, true);
            view.setUint16(32, 4, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, 'data');
            view.setUint32(40, length, true);

            // Write audio data
            const floatArray = new Float32Array(renderedBuffer.length);
            renderedBuffer.copyFromChannel(floatArray, 0);
            for (let i = 0; i < floatArray.length; i++) {
                view.setInt16(44 + i * 2, floatArray[i] * 0x7FFF, true);
            }

            resolve(new Blob([view], { type: 'audio/wav' }));
        });

        return wavBlob;
    };

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            mediaRecorderRef.current = new MediaRecorder(stream)
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                const wavBlob = await convertToWav(blob)
                const url = URL.createObjectURL(wavBlob)
                setAudioUrl(url)
                onAudioCapture(wavBlob)
                chunksRef.current = []
                
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop())
                    streamRef.current = null
                }
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
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setAudioUrl(null)
        onAudioCapture(null)
    }
    
    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="w-16 h-16 rounded-full bg-[#aa95d1] text-white hover:bg-purple-300"
            >
                {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <p>{isRecording ? "Recording..." : "Click to start recording"}</p>
            {audioUrl && (
                <div className="flex gap-2">
                    <Button onClick={handlePlay} className="bg-[#aa95d1] text-white hover:bg-purple-300">
                        <Play className="w-4 h-4 mr-2" /> Play
                    </Button>
                    <Button onClick={handleReset} className="bg-[#aa95d1] text-white hover:bg-purple-300">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                </div>
            )}
            <audio ref={audioRef} src={audioUrl} />
        </div>
    )
}

export default InputMic

