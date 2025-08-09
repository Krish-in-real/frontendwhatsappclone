import React from "react";

export default function MessageBubble({ message, meId, datetimeStr }) {
    // backend message uses fields: sender_id, receiver_id, content, timestamp
    function formatToIST(datetimeStr) {
        if (!datetimeStr) return "";

        // Trim microseconds to milliseconds (JS Date supports max 3 decimals)
        const cleanedStr = datetimeStr.includes(".")
            ? datetimeStr.replace(/(\.\d{3})\d+/, "$1")
            : datetimeStr;

        // Append 'Z' if no timezone info to treat as UTC
        const utcStr = /Z|[+\-]\d{2}:\d{2}$/.test(cleanedStr)
            ? cleanedStr
            : cleanedStr + "Z";

        const date = new Date(utcStr);

        // Format options with Asia/Kolkata timezone
        const options = {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
            timeZoneName: "short",
        };

        return date.toLocaleString("en-IN", options).replace(",", "");
    }



    // // Example:
    // const input = "2025-08-09T16:39:41.086000";
    // console.log(formatToIST(input));
    // Output: "09-Aug-2025 10:09:41 PM IST"

    const sender = message.sender_id || message.sender || "";
    const mine = meId && sender === meId;

    const time = message.timestamp ? formatToIST(message.timestamp) : ""

    return (
        <div className={`my-3 flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`${mine ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"} max-w-[70%] px-4 py-2 rounded-2xl`}>
                <div className="whitespace-pre-wrap">{message.content || message.text || ""}</div>
                <div className={`text-[11px] mt-1 text-right ${mine ? "text-green-100" : "text-gray-500"}`}>
                    {time || message.timestamp}
                </div>
            </div>
        </div>
    );
}
