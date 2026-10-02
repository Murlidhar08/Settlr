"use client";

import AppTabs from "@/components/tab/app-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseRoles } from "@/lib/auth/permissions";
import { cn, getFileUrl } from "@/lib/utils";
import { useRemoveUserRole } from "@/tanstacks/user";
import { getInitials, getRoleBadgeColor } from "@/utility/common-function";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AtSign,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Edit2,
  ExternalLink,
  FileText,
  Hash,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  RefreshCw,
  Trash2,
  User as UserIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DocumentList } from "./document-list";

interface UserDetailViewProps {
  user: any;
  role: "client" | "agent" | "owner";
}

function InfoItem({ icon, label, value, highlight }: { icon: ReactNode, label: string, value: ReactNode, highlight?: boolean }) {
  return (
    <div className="group flex items-start gap-4">
      <div className="mt-1 p-2.5 rounded-2xl bg-muted/50 text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-sm border border-border/20">
        {icon}
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{label}</p>
        <div className={cn("text-sm font-black tracking-tight line-clamp-2",
          highlight ? 'text-primary' : 'text-foreground/90')}>
          {value}
        </div>
      </div>
    </div>
  );
}

export function UserDetailView({ user, role }: UserDetailViewProps) {
  const router = useRouter();
  const removeRoleMutation = useRemoveUserRole();

  const handleWhatsApp = () => {
    if (user.contact) {
      const number = user.contact.replace(/\D/g, "");
      window.open(`https://wa.me/91${number}`, "_blank");
    }
  };

  const handleEdit = () => {
    router.push(`/user/${user.id}/edit` as any);
  };

  const handleDeleteRole = async () => {
    try {
      const result: any = await removeRoleMutation.mutateAsync({ userId: user.id, roleToRemove: role });
      if (result?.deletedUser) {
        toast.success(`User and their ${role} role removed as no roles remained`);
      } else {
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role removed successfully`);
      }
      router.push(`/${role}` as any);
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  const roles = parseRoles(user?.role).map((r) => r.charAt(0).toUpperCase() + r.slice(1));

  const menuItems = [
    { label: "Refresh", icon: <RefreshCw size={16} className="text-emerald-500" />, onClick: () => window.location.reload() },
    { label: "Edit", icon: <Edit2 size={16} className="text-blue-600" />, onClick: handleEdit },
    { label: "Delete", icon: <Trash2 size={16} className="text-red-500" />, onClick: handleDeleteRole },
  ];

  const tabs = [
    {
      id: "general",
      label: "GENERAL",
      icon: <UserIcon size={18} />,
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
          {/* Basic Information */}
          <Card className="p-8 rounded-[2rem] border-border/50 bg-card backdrop-blur-sm shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
            <h3 className="text-xs font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <UserIcon size={16} className="text-primary" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <InfoItem icon={<Hash size={18} />} label="ID" value={user.id} />
              <InfoItem icon={<UserIcon size={18} />} label="Name" value={user.name} />
              <InfoItem icon={<AtSign size={18} />} label="Email" value={
                <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
              } />
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 rounded-[2rem] border-border/50 bg-card backdrop-blur-sm shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/20" />
            <h3 className="text-xs font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Phone size={16} className="text-indigo-500" />
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <InfoItem icon={<Phone size={18} />} label="Phone Number" value={
                user.contact ? (
                  <a href={`tel:${user.contact}`} className="text-primary hover:underline">{user.contact}</a>
                ) : "N/A"
              } />
              <InfoItem icon={<Briefcase size={18} />} label="Occupation" value={user.occupation || "N/A"} />
              <InfoItem icon={<MapPin size={18} />} label="Address" value={user.address || "N/A"} />
            </div>
          </Card>

          {/* Bio / Description */}
          <Card className="p-8 rounded-[2rem] border-border/50 bg-card backdrop-blur-sm shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/20" />
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/80">Bio / Description</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed bg-muted/20 p-6 rounded-2xl border border-border/50 text-foreground/80">
              {user.description || "No description provided for this profile."}
            </p>
          </Card>

          {/* Metadata */}
          <Card className="p-8 rounded-[2rem] border-border/50 bg-card backdrop-blur-sm shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20" />
            <h3 className="text-xs font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Clock size={16} className="text-emerald-500" />
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
              <InfoItem icon={<UserIcon size={18} />} label="Created By" value={user.creatorName || "System"} />
              <InfoItem icon={<Calendar size={18} />} label="Created At" value={user.createdAt ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss") : "N/A"} />
              <InfoItem icon={<UserIcon size={18} />} label="Updated By" value={user.updaterName || "System"} />
              <InfoItem icon={<Calendar size={18} />} label="Updated At" value={user.updatedAt ? format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm:ss") : "N/A"} />
            </div>
          </Card>

          {/* WhatsApp Support Button */}
          {user.contact && (
            <div className="flex justify-center md:justify-start pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsApp}
                className="flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 rounded-[1.5rem] shadow-xl shadow-[#25D366]/20 font-black uppercase tracking-widest text-sm"
              >
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </motion.button>
            </div>
          )}
        </div>
      )
    },
    {
      id: role === "client" ? "requirements" : "properties",
      label: role === "client" ? "REQUIREMENTS" : "PROPERTIES",
      icon: role === "client" ? <Bookmark size={18} /> : <Building2 size={18} />,
      content: (
        <div className="py-6 space-y-6">
          {(role === "client" ? user.requirements : (role === "agent" ? user.agentProperties : user.properties))?.map((item: any, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 flex-row rounded-3xl border-border bg-card shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group flex items-center justify-between gap-6 cursor-pointer"
                onClick={() => router.push(`/${role === "client" ? "requirement" : "property"}/${item.id}` as any)}
              >
                <div className="flex items-center gap-6 text-left">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-border shadow-inner group-hover:scale-110 transition-transform",
                    role === 'client' ? 'bg-amber-500/10' : 'bg-primary/10')}>
                    {role === 'client' ? <Bookmark className="text-amber-500" /> : <Building2 className="text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-black tracking-tight text-foreground group-hover:text-primary transition-colors truncate max-w-50 sm:max-w-md">{item.title}</h5>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{item.propertyType}</span>
                      <div className="h-3 w-px bg-border" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                        <Clock size={10} /> {format(new Date(item.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={18} />
                </Button>
              </Card>
            </motion.div>
          ))}
          {(role === "client" ? user.requirements : (role === "agent" ? user.agentProperties : user.properties))?.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No records found for this {role}</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: "documents",
      label: "DOCUMENTS",
      icon: <FileText size={18} />,
      content: (
        <div className="py-6">
          <DocumentList userId={user.id} documents={user.userDocuments} />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-full w-full bg-background p-4 sm:p-8 lg:p-12 space-y-10 max-w-7xl mx-auto overflow-x-hidden">
      {/* Reference Styled Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-border/50">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
          <div className="flex items-center self-end sm:self-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-muted/40 hover:bg-muted border border-border/50 shadow-sm transition-all">
                  <MoreVertical size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-2xl min-w-50 p-2 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors",
                      item.label === "Delete" ? "text-red-500 hover:text-red-600 focus:text-red-600" : ""
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <Avatar className="h-32 w-32 sm:h-36 sm:w-36 rounded-[2.5rem] border-4 border-background shadow-2xl relative transition-transform duration-700 group-hover:scale-105">
              <AvatarImage src={getFileUrl(user.image)} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-foreground truncate min-w-75 sm:max-w-md">{user.name}</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 sm:gap-6 text-muted-foreground font-bold text-sm">
              <span className="flex items-center justify-center sm:justify-start gap-2 text-primary/80">
                <AtSign size={16} />
                {user.username || `${user.name.toLowerCase().replace(' ', '_')}`}
              </span>
              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-border" />
              <span className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin size={16} />
                {user.address || "Unknown Location"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {roles.map((r) => (
                <Badge key={r} className={cn("border px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs shadow-black/5", getRoleBadgeColor(r))}>
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs System Container */}
      <AppTabs tabs={tabs} defaultTab="general" />
    </div>
  );
}
