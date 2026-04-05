import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { motion } from 'framer-motion';
import { glassCardEntrance } from '@/components/animations/variants';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const AuthBackground = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0a 0%, #111111 40%, #1a0a0a 100%);
    position: relative;
    overflow: hidden;
    padding: 1rem;

    /* Hide the reCAPTCHA badge */
    .grecaptcha-badge {
        visibility: hidden !important;
    }

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at 30% 40%, rgba(255, 76, 76, 0.04) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(255, 76, 76, 0.03) 0%, transparent 50%);
        pointer-events: none;
    }
`;

const GlassCard = styled(motion.div)`
    width: 100%;
    max-width: 440px;
    background: rgba(26, 26, 26, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 2.5rem 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02);
    position: relative;
    z-index: 1;

    @media (min-width: 640px) {
        padding: 3rem 2.5rem;
    }

    /* Override input styling for auth forms */
    input[type='text'],
    input[type='password'],
    input[type='email'] {
        background-color: rgba(17, 17, 17, 0.8) !important;
        border: 1px solid #2a2a2a !important;
        border-radius: 8px !important;
        color: #f0f0f0 !important;
        padding: 0.625rem 0.875rem !important;
        font-size: 0.875rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
            border-color: #FF4C4C !important;
            box-shadow: 0 0 0 2px rgba(255, 76, 76, 0.15), 0 0 16px rgba(255, 76, 76, 0.06) !important;
            outline: none;
        }

        &::placeholder {
            color: #525252;
        }
    }

    label {
        color: #a3a3a3 !important;
        font-size: 0.8rem;
        font-weight: 500;
        letter-spacing: 0.02em;
    }

    /* Style buttons */
    button[type='submit'] {
        width: 100%;
        background: linear-gradient(135deg, #FF4C4C, #e63e3e) !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 0.625rem 1.25rem !important;
        font-weight: 600;
        font-size: 0.875rem;
        color: #fff !important;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        box-shadow: 0 2px 8px rgba(255, 76, 76, 0.2);

        &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(255, 76, 76, 0.3);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }
    }

    p[class*='description'] {
        color: #737373;
    }

    /* Ensure form children stack vertically */
    form {
        display: flex;
        flex-direction: column;
    }
`;

const LogoMark = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
`;

const FooterText = styled.p`
    text-align: center;
    color: #525252;
    font-size: 0.7rem;
    margin-top: 2rem;
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <AuthBackground>
        <GlassCard
            variants={glassCardEntrance}
            initial={'hidden'}
            animate={'visible'}
        >
            <LogoMark>
                <motion.svg
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    initial={{ rotate: -12, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.25 }}
                >
                    <rect width="32" height="32" rx="8" fill="#FF4C4C"/>
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontWeight="700" fontSize="18" fontFamily="IBM Plex Sans, sans-serif">L</text>
                </motion.svg>
            </LogoMark>
            {title && (
                <h2 style={{
                    textAlign: 'center',
                    color: '#f0f0f0',
                    fontWeight: 600,
                    fontSize: '1.375rem',
                    marginBottom: '0.25rem',
                    letterSpacing: '-0.01em',
                }}>
                    {title}
                </h2>
            )}
            <p style={{ textAlign: 'center', color: '#525252', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
                Secure access to your servers
            </p>
            <FlashMessageRender css={tw`mb-4`} />
            <Form {...props} ref={ref}>
                {props.children}
            </Form>
            <FooterText>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    rel={'noopener nofollow noreferrer'}
                    href={'https://pterodactyl.io'}
                    target={'_blank'}
                    style={{ color: '#525252', textDecoration: 'none' }}
                >
                    Pterodactyl Software
                </a>
            </FooterText>
        </GlassCard>
    </AuthBackground>
));
