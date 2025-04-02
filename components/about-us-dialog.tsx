"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AboutUsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          About Us
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-morphism sm:max-w-[425px] gap-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">About Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to Spectre Hub, your premier destination for educational content and video streaming.
          </p>
          <p className="text-muted-foreground">
            Our mission is to provide high-quality educational resources accessible to everyone, 
            anywhere in the world.
          </p>
          <p className="text-muted-foreground">
            We believe in the power of knowledge sharing and continuous learning.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 