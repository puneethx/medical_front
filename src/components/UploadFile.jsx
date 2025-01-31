"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Play, RotateCcw } from "lucide-react"

const UploadFile = ({ onFileSelect }) => {
    const [fileName, setFileName] = useState(null)
    const [audioUrl, setAudioUrl] = useState(null)
    const fileInputRef = useRef(null)
    const audioRef = useRef(null)
  
    const handleFileChange = (event) => {
      const file = event.target.files?.[0]
      if (file && file.type === "audio/wav") {
        setFileName(file.name)
        setAudioUrl(URL.createObjectURL(file))
        onFileSelect(file)
      } else {
        alert("Please select a WAV file. Other audio formats are not supported.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  
    const handleClick = () => {
      fileInputRef.current?.click()
    }
  
    const handlePlay = () => {
      audioRef.current?.play()
    }
  
    const handleReset = () => {
      setFileName(null)
      setAudioUrl(null)
      onFileSelect(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  
  
    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={handleClick} variant="outline" className="w-full h-32 border-dashed border-black text-black">
          <Upload className="w-6 h-6 mr-2" />
          {fileName ? fileName : "Click to upload .wav file"}
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".wav" className="hidden" />
        {audioUrl && (
          <div className="flex gap-2">
            <Button onClick={handlePlay} className="bg-black text-white hover:bg-gray-800">
              <Play className="w-6 h-6 mr-2" /> Play
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

export default UploadFile