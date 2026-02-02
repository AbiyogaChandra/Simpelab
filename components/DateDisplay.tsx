"use client";

import moment from "moment";

interface DateDisplayProps {
    date?: Date | string;
    format?: string;
}

export default function DateDisplay({
    date,
    format = "DD MMMM YYYY"
}: DateDisplayProps) {
    const formattedDate = moment(date || new Date()).format(format);

    return (
        <div className="text-sm text-gray-600">
            {formattedDate}
        </div>
    );
}
