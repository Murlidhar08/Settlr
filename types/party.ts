import { PartyType } from "@/lib/generated/prisma/enums";

export interface PartyRes {
  id: string;
  name: string;
  amount: number;
  contactNo?: string | null;
  profileUrl?: string | null;
  isActive?: boolean;
}

export interface PartyInput {
  name: string;
  type: PartyType;
  contactNo?: string | null;
}
