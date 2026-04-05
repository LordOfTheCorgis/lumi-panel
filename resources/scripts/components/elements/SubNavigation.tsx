import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full overflow-x-auto`};
    background-color: #1a1a1a;
    border-bottom: 1px solid #222222;

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 no-underline whitespace-nowrap transition-all duration-100`};
            color: #a3a3a3;

            &:not(:first-of-type) {
                ${tw`ml-1`};
            }

            &:hover {
                color: #f0f0f0;
            }

            &:active,
            &.active {
                color: #f0f0f0;
                box-shadow: inset 0 -2px #FF4C4C;
            }
        }
    }
`;

export default SubNavigation;
