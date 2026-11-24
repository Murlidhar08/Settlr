"use client"

import { FooterButtons } from "@/components/footer-buttons";
import { AddTransactionModal } from "@/components/transaction/add-transaction-modal";
import { Button } from "@/components/ui/button";
import { tran } from "@/lib/languages/i18n";
import { TransactionDirection } from "@/types/transaction/TransactionDirection";
import { Plus } from "lucide-react";

export function AddTransactionButton() {
    return (
        <FooterButtons>
            <AddTransactionModal
                title={tran("cashbook.new_entry")}
                direction={TransactionDirection.OUT}
                path="/cashbook"
            >
                <Button className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2">
                    <Plus className="size-6 sm:size-5" />
                    <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
                        {tran("cashbook.add_entry")}
                    </span>
                </Button>
            </AddTransactionModal>
        </FooterButtons>
    );
}