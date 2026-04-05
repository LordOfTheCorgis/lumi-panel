import * as React from 'react';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return 'background-color: rgba(255, 76, 76, 0.1); border: 1px solid rgba(255, 76, 76, 0.3);';
        case 'info':
            return 'background-color: rgba(255, 76, 76, 0.08); border: 1px solid rgba(255, 76, 76, 0.2);';
        case 'success':
            return 'background-color: rgba(138, 191, 101, 0.1); border: 1px solid rgba(138, 191, 101, 0.3);';
        case 'warning':
            return 'background-color: rgba(230, 162, 60, 0.1); border: 1px solid rgba(230, 162, 60, 0.3);';
        default:
            return '';
    }
};

const getBackground = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return 'background-color: rgba(255, 76, 76, 0.2);';
        case 'info':
            return 'background-color: rgba(255, 76, 76, 0.15);';
        case 'success':
            return 'background-color: rgba(138, 191, 101, 0.2);';
        case 'warning':
            return 'background-color: rgba(230, 162, 60, 0.2);';
        default:
            return '';
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-2 border items-center leading-normal rounded flex w-full text-sm text-white`};
    ${(props) => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`lg:inline-flex`} $type={type} role={'alert'}>
        {title && (
            <span
                className={'title'}
                css={[
                    tw`flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3 leading-none`,
                    getBackground(type),
                ]}
            >
                {title}
            </span>
        )}
        <span css={tw`mr-2 text-left flex-auto`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
