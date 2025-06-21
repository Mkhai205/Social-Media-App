"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import lodash from "lodash";

import { searchIcon } from "@/utils/icons";
import { useUserContext } from "@/context/userContext";

function SearchInput() {
    const { searchUsers, setSearchResults, searchResults } = useUserContext();

    const [search, setSearch] = useState("");

    const debouncedSearchUsers = useCallback(
        lodash.debounce((value: string) => {
            searchUsers(value);
        }, 500),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.trimStart();
        setSearch(searchValue);

        if (searchValue.length > 0) {
            debouncedSearchUsers(searchValue);
        } else {
            debouncedSearchUsers.cancel(); // Cancel any pending debounced calls
            setSearchResults([]); // Clear search results if input is empty
        }
    };

    useEffect(() => {
        // Cleanup function to cancel the debounced function on unmount
        return () => {
            debouncedSearchUsers.cancel();
        };
    }, [debouncedSearchUsers]);

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
