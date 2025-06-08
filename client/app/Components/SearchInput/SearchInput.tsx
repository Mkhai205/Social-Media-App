"use client";

import { searchIcon } from "@/utils/icons";
import React from "react";

function SearchInput() {
    const [search, setSearch] = React.useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    return (
        <form className="rounded-xl">
            <div className="relative">
                <span className="absolute top-1/2 pl-2 text-slate-600 translate-y-[-50%] text-lg">
                    {searchIcon}
                </span>
                <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => handleSearchChange(e)}
                    autoComplete="off"
                    className="w-full pl-8 pr-2 py-2 bg-white dark:bg-transparent border-2 border-white
                            dark:border-[#3C3C3C]/60 dark:text-slate-300 rounded-xl text-gray-800  focus:outline-none 
                            focus:ring-2 focus:ring-[#ccc] focus:ring-opacity-50 transition duration-300 ease-in-out"
                />
            </div>
        </form>
    );
}

export default SearchInput;
