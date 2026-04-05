import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-4`}>
                    <p className={'text-center text-xs'} style={{ color: '#525252' }}>
                        &copy; 2015&ndash;2026{' '}
                        <a
                            rel={'noopener nofollow noreferrer'}
                            href={'https://pterodactyl.io'}
                            target={'_blank'}
                            className={'no-underline transition-colors duration-100'}
                            style={{ color: '#525252' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#737373')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#525252')}
                        >
                            Pterodactyl
                        </a>
                        {' '}&middot; &copy; 2025&ndash;2026 Lumix Solutions
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
