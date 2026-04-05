import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex no-underline items-center p-4 transition-colors duration-100 overflow-hidden`};
    background-color: #1a1a1a;
    border: 1px solid #222222;
    border-radius: 3px;
    color: #d4d4d4;

    ${(props) => props.$hoverable !== false && `
        &:hover {
            border-color: #333333;
            background-color: #1e1e1e;
        }
    `};

    & .icon {
        ${tw`w-12 flex items-center justify-center p-2`};
        background-color: #222222;
        border-radius: 3px;
        color: #a3a3a3;
    }
`;
