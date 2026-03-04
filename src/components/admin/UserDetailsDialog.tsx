"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, User, ShieldCheck, MapPin, Phone, Mail, FileText } from "lucide-react";
import UserManager from "./UserManager";

interface UserDetailsDialogProps {
  user: any;
  onUpdate: () => void;
}

const UserDetailsDialog = ({ user, onUpdate }: UserDetailsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-orange-600">
          <Eye size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-slate-900 text-white p-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="bg-orange-500 p-2 rounded-xl">
              <User size={20} />
            </div>
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 bg-slate-50">
          <UserManager user={user} onSuccess={onUpdate} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;