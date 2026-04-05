import React from 'react';
import { Route } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { pageTransition } from '@/components/animations/variants';

const Wrapper = styled.div`
    ${tw`relative`};
`;

const TransitionRouter: React.FC = ({ children }) => {
    return (
        <Route
            render={({ location }) => (
                <Wrapper>
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={location.pathname + location.search}
                            variants={pageTransition}
                            initial={'initial'}
                            animate={'animate'}
                            exit={'exit'}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </Wrapper>
            )}
        />
    );
};

export default TransitionRouter;
