import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-block p-2 uppercase tracking-wide text-sm transition-all duration-100`};
    border-radius: 2px;
    border: none;

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            ${(props) => !props.isSecondary && css`
                background-color: #FF4C4C;
                color: #ffffff;
            `};

            &:hover:not(:disabled) {
                background-color: #e63e3e;
            }
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            background-color: #2a2a2a;
            border: 1px solid #3a3a3a;
            color: #d4d4d4;

            &:hover:not(:disabled) {
                background-color: #333333;
                border-color: #444444;
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css<Props>`
            background-color: #2a2a2a;
            border: 1px solid #3a3a3a;
            color: #d4d4d4;

            &:hover:not(:disabled) {
                background-color: #333333;
                border-color: #444444;
            }

            ${(props) =>
                props.isSecondary &&
                css`
                    &:active:not(:disabled) {
                        background-color: #333333;
                    }
                `};
        `};

    ${(props) =>
        props.color === 'red' &&
        css<Props>`
            background-color: #FF4C4C;
            color: #ffffff;

            &:hover:not(:disabled) {
                background-color: #e63e3e;
            }

            ${(props) =>
                props.isSecondary &&
                css`
                    &:active:not(:disabled) {
                        background-color: #cc3333;
                    }
                `};
        `};

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`p-4 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`p-4 w-full`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            background-color: transparent;
            border: 1px solid #3a3a3a;
            color: #d4d4d4;

            &:hover:not(:disabled) {
                border-color: #525252;
                color: #f0f0f0;
                ${(props) => props.color === 'red' && css`background-color: #FF4C4C; border-color: #FF4C4C; color: #ffffff;`};
                ${(props) => props.color === 'primary' && css`background-color: #FF4C4C; border-color: #FF4C4C; color: #ffffff;`};
                ${(props) => props.color === 'green' && css`background-color: #333333; border-color: #444444; color: #f0f0f0;`};
            }
        `};

    &:disabled {
        opacity: 0.55;
        cursor: default;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
