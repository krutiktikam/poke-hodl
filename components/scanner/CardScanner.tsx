"use client";

import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Camera, Upload, Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseOCRText, ScannedCardInfo } from "@/lib/ocr";
import { fetchCards } from "@/lib/api";
import { PokemonCard } from "@/types/pokemon";
import Image from "next/image";
import { toast } from "sonner";

interface CardScannerProps {
  onCardFound: (card: PokemonCard) => void;
}

export function CardScanner({ onCardFound }: CardScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedInfo, setScannedInfo] = useState<ScannedCardInfo | null>(null);
  const [matchedCards, setMatchedCards] = useState<PokemonCard[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (imageSrc: string) => {
    setIsProcessing(true);
    setProgress(0);
    setScannedInfo(null);
    setMatchedCards([]);
    setImagePreview(imageSrc);

    try {
      // 1. Send image to our Gemini Vision API route
      const aiResponse = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || "Failed to scan image with AI");
      }
      
      const info = await aiResponse.json();
      console.log("Vision AI Data:", info);
      
      const parsedInfo: ScannedCardInfo = {
        name: info.name,
        number: info.number,
        total: info.total,
        fullId: info.number && info.total ? `${info.number}/${info.total}` : info.number,
      };
      
      setScannedInfo(parsedInfo);

      if (parsedInfo.name || parsedInfo.number || info.attack || info.setCode) {
        // Build a query for the Pokémon TCG API
        let queryParts = [];

        // 1. If we have a setCode (PTCGL code like 'SVI', 'MEW'), it's extremely high precision
        if (info.setCode) {
          queryParts.push(`set.ptcgoCode:"${info.setCode}"`);
        }

        if (parsedInfo.name) {
          // Normalize name for API matching
          let searchName = parsedInfo.name
            .replace(/^MEGA\s+/i, 'M ')
            .replace(/\s+EX$/i, '-EX')
            .replace(/\s+ex$/i, ' ex');
          
          queryParts.push(`name:"*${searchName}*"`);
        }
        
        if (parsedInfo.number) {
          queryParts.push(`number:"${parsedInfo.number}"`);
        }

        let query = queryParts.join(' ');
        console.log("TCG API Query (with PTCGL code):", query);

        let response = await fetchCards(query.trim());
        
        // Fallback 1: If name/number fails, try name + attack
        if (response.data.length === 0 && parsedInfo.name && info.attack) {
          console.log("Fallback: Searching by Name + Attack");
          const fallbackQuery = `name:"*${parsedInfo.name.split(' ').pop()}*" attacks.name:"*${info.attack}*"`;
          response = await fetchCards(fallbackQuery);
        }

        // Fallback 2: If still fails, try just the attack name (very high confidence)
        if (response.data.length === 0 && info.attack) {
          console.log("Fallback: Searching by Attack Name only");
          response = await fetchCards(`attacks.name:"*${info.attack}*"`);
        }
        
        const uniqueMap = new Map();
        response.data.forEach(card => {
          if (!uniqueMap.has(card.id)) {
            uniqueMap.set(card.id, card);
          }
        });
        setMatchedCards(Array.from(uniqueMap.values()));
      } else {
        toast.error("AI could not identify the card. Try a clearer photo.");
      }
    } catch (error) {
      console.error("Vision Error:", error);
      toast.error("Failed to process image with Vision AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden border-2 border-dashed">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
              <Camera className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">AI Card Scanner</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[250px]">
              Upload a screenshot or photo of any Pokémon card to identify it instantly.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 rounded-xl font-bold w-full"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing {progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scan Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
            {imagePreview ? (
              <div className="relative w-full aspect-[2/3] max-w-[200px] rounded-xl overflow-hidden shadow-lg">
                <Image src={imagePreview} alt="Preview" fill priority className="object-contain" />
              </div>
            ) : (
              <div className="text-slate-300 text-center">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Input</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {(scannedInfo || matchedCards.length > 0) && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-slate-100" />
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Recognition Results</h2>
            <div className="h-px flex-grow bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900 text-white rounded-[2rem] p-6 lg:col-span-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Extracted Data</CardTitle>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-[10px] font-bold text-white/50 uppercase">Probable Name</span>
                  <span className="font-bold">{scannedInfo?.name || "???"}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-[10px] font-bold text-white/50 uppercase">Card ID</span>
                  <span className="font-bold">{scannedInfo?.fullId || scannedInfo?.number || "???"}</span>
                </div>
                <div className="pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    AI confidence: {scannedInfo?.name ? 'High' : 'Low'}
                  </div>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-slate-900 mb-4">Matches Found ({matchedCards.length})</h3>
              {matchedCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchedCards.map((card, index) => (
                    <Card key={`${card.id}-${index}`} className="p-4 hover:shadow-md transition-all border-slate-100 bg-white group cursor-pointer" onClick={() => onCardFound(card)}>
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-14 flex-shrink-0">
                          <Image src={card.images.small} alt={card.name} fill className="object-contain" sizes="56px" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{card.name}</h4>
                          <p className="text-xs text-slate-500 truncate">{card.set.name}</p>
                          <p className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-tighter">#{card.number}</p>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg">Select</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl py-12 text-center">
                  <XCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No exact matches in the database.</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Try uploading a higher quality image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
