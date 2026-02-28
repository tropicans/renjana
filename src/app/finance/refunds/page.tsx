"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export default function RefundsPage() {
    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Refunds</h1><p className="text-gray-500 mt-1">Pengajuan pengembalian dana</p></div>
            <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <RotateCcw className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada pengajuan refund.</p>
                <p className="text-xs text-gray-400 mt-1">Fitur refund akan tersedia di versi berikutnya.</p>
            </div>
        </div>
    );
}
