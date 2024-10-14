import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const Popup = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Popup;
