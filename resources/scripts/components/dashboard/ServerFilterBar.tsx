import React from 'react';
import { faSearch, faFilter, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/macro';
import { motion } from 'framer-motion';

export type StatusFilter = 'all' | 'online' | 'offline';
export type SortOption = 'name' | 'status';

interface Props {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (value: StatusFilter) => void;
    sortBy: SortOption;
    onSortChange: (value: SortOption) => void;
}

const FilterContainer = styled(motion.div)`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    align-items: center;
`;

const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    min-width: 200px;
`;

const SearchIcon = styled.span`
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #525252;
    font-size: 0.8rem;
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    background-color: #1a1a1a;
    border: 1px solid #222222;
    border-radius: 6px;
    color: #f0f0f0;
    font-size: 0.875rem;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    outline: none;

    &::placeholder {
        color: #525252;
    }

    &:focus {
        border-color: #FF4C4C;
        box-shadow: 0 0 0 2px rgba(255, 76, 76, 0.15), 0 0 12px rgba(255, 76, 76, 0.08);
    }
`;

const SelectWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.375rem;
`;

const SelectIcon = styled.span`
    color: #525252;
    font-size: 0.75rem;
`;

const StyledSelect = styled.select`
    appearance: none;
    background-color: #1a1a1a;
    border: 1px solid #222222;
    border-radius: 6px;
    color: #a3a3a3;
    font-size: 0.8rem;
    padding: 0.5rem 2rem 0.5rem 0.625rem;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23525252'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.625rem center;

    &:focus {
        border-color: #FF4C4C;
        box-shadow: 0 0 0 2px rgba(255, 76, 76, 0.15);
    }

    &:hover {
        border-color: #333333;
    }

    option {
        background-color: #1a1a1a;
        color: #a3a3a3;
    }
`;

const ServerFilterBar = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    onSortChange,
}: Props) => (
    <FilterContainer
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
    >
        <SearchWrapper>
            <SearchIcon>
                <FontAwesomeIcon icon={faSearch} />
            </SearchIcon>
            <SearchInput
                type={'text'}
                placeholder={'Search servers...'}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </SearchWrapper>
        <SelectWrapper>
            <SelectIcon>
                <FontAwesomeIcon icon={faFilter} />
            </SelectIcon>
            <StyledSelect
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            >
                <option value={'all'}>All</option>
                <option value={'online'}>Online</option>
                <option value={'offline'}>Offline</option>
            </StyledSelect>
        </SelectWrapper>
        <SelectWrapper>
            <SelectIcon>
                <FontAwesomeIcon icon={faSort} />
            </SelectIcon>
            <StyledSelect
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
            >
                <option value={'name'}>Name</option>
                <option value={'status'}>Status</option>
            </StyledSelect>
        </SelectWrapper>
    </FilterContainer>
);

export default ServerFilterBar;
