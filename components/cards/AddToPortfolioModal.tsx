"use client";

import { useState } from "react";
import { PokemonCard } from "@/types/pokemon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

interface AddToPortfolioModalProps {
  card: PokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPortfolioModal({ card, isOpen, onClose }: AddToPortfolioModalProps) {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState("Near Mint");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be signed in to add cards to your vault.");
        setIsSubmitting(false);
        return;
      }

      // 2. Insert into Supabase
      const { error } = await supabase
        .from('portfolio')
        .insert({
          user_id: session.user.id,
          card_id: card.id,
          card_name: card.name,
          set_name: card.set.name,
          image_url: card.images.small,
          purchase_price: parseFloat(purchasePrice),
          purchase_date: purchaseDate,
          condition: condition,
          quantity: 1
        });

      if (error) throw error;
      
      toast.success(`${card.name} added to your vault!`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add card to portfolio.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Add to Portfolio</DialogTitle>
          <DialogDescription>
            Enter your purchase details for this card.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="relative h-20 w-14 flex-shrink-0">
            <Image 
              src={card.images.small} 
              alt={card.name} 
              fill 
              className="object-contain" 
              sizes="56px"
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{card.name}</h3>
            <p className="text-xs text-slate-500">{card.set.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Purchase Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Purchase Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as string)}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mint">Mint</SelectItem>
                <SelectItem value="Near Mint">Near Mint</SelectItem>
                <SelectItem value="Lightly Played">Lightly Played</SelectItem>
                <SelectItem value="Moderately Played">Moderately Played</SelectItem>
                <SelectItem value="Heavily Played">Heavily Played</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Confirm Addition"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
