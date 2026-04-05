import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Modal from '@/components/elements/Modal';
import McModsVersionsRow from './McModsVersionsRow';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import getMinecraftMcModsDescription from '@/api/server/mcmods/getMinecraftMcModsDescription';
import { ServerContext } from '@/state/server';

interface Props {
  minecraftMcMods: any;
  className?: string;
  type: string;
}

export default ({ minecraftMcMods, className, type }: Props) => {
  const { clearAndAddHttpError } = useFlash();
  const [visible, setVisible] = useState('');
  const [infoload, setInfoLoad] = useState(false);
  const [description, setDescription] = useState('');
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

  // Normalize data between CurseForge and Modrinth
  const mod = {
    id: type === 'modrinth' ? minecraftMcMods.project_id : minecraftMcMods.id,
    name: type === 'modrinth' ? minecraftMcMods.title : minecraftMcMods.name,
    icon: type === 'modrinth' ? minecraftMcMods.icon_url : minecraftMcMods.logo?.thumbnailUrl,
    url: type === 'modrinth'
      ? `https://modrinth.com/mod/${minecraftMcMods.slug}`
      : minecraftMcMods.links?.websiteUrl,
    summary: type === 'modrinth' ? minecraftMcMods.description : minecraftMcMods.summary,
    categories: type === 'modrinth'
      ? (minecraftMcMods.display_categories || [])
      : (minecraftMcMods.categories || []),
  };

  const getDescription = () => {
    setInfoLoad(true);
    getMinecraftMcModsDescription(uuid, mod.id, type)
      .then((data) => {
        setDescription(data);
        setInfoLoad(false);
        setVisible('informations');
      })
      .catch((e) => {
        clearAndAddHttpError({ key: mod.id, error: e });
        setInfoLoad(false);
      });
  };

  return (
    <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center mb-2`} className={className}>
      <Modal
        visible={visible === 'informations'}
        onDismissed={() => {
          setVisible('');
          setDescription('');
        }}
      >
        <FlashMessageRender byKey={mod.id} css={tw`mb-4`} />
        <div
          css={tw`max-h-96 overflow-y-auto text-sm`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </Modal>
      <Modal
        visible={visible === 'versions'}
        onDismissed={() => {
          setVisible('');
        }}
      >
        <FlashMessageRender byKey={mod.id} css={tw`mb-4`} />
        <McModsVersionsRow minecraftMcMods={{ ...minecraftMcMods, id: mod.id }} type={type} />
      </Modal>
      <div css={tw`flex items-center truncate w-full md:flex-1`}>
        <div css={tw`flex flex-col truncate`}>
          <div css={tw`flex items-center text-sm mb-1`}>
            {mod.icon && (
              <div
                css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}
                title={mod.name}
              >
                <img css={tw`w-full h-full object-cover`} alt={mod.name} src={mod.icon} />
              </div>
            )}
            <a
              href={mod.url}
              css={tw`ml-4 break-words truncate`}
              title={mod.summary}
              target={'_blank'}
              rel={'noreferrer'}
            >
              {mod.name}
              <br />
              <div css={tw`text-2xs text-neutral-400`}>Description (Hover me)</div>
            </a>
          </div>
          <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
            {type === 'modrinth' ? (
              <span>{mod.categories.join(', ')}</span>
            ) : (
              mod.categories.map((category: any, index: number) => (
                <img
                  css={index > 0 ? tw`ml-1 w-8 h-8 inline` : tw`w-8 h-8 inline`}
                  key={category.name || index}
                  src={category.iconUrl}
                  alt={category.name}
                  title={category.name}
                />
              ))
            )}
          </p>
        </div>
      </div>

      <div css={tw`mt-4 md:mt-0 ml-6 grid grid-rows-2 gap-y-2`} style={{ marginRight: '-0.5rem' }}>
        <Button
          type={'button'}
          aria-label={'More Informations'}
          onClick={() => getDescription()}
          title='More Informations'
          isLoading={infoload}
          isSecondary
        >
          <FontAwesomeIcon icon={faPaperclip} /> Info
        </Button>

        <Button
          type={'button'}
          aria-label={'Install'}
          onClick={() => setVisible('versions')}
          title='Download and Install'
        >
          <FontAwesomeIcon icon={faDownload} /> Install
        </Button>
      </div>
    </GreyRowBox>
  );
};

