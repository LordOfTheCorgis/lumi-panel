import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-xs uppercase mb-1 sm:mb-2`};
    color: #a3a3a3;
    letter-spacing: 0.05em;
    ${(props) => props.isLight && tw`text-neutral-700`};
`;

export default Label;
