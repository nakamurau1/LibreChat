import { useRecoilState } from 'recoil';
import { useChatContext } from '~/Providers';
import { useRequiresKey } from '~/hooks';
import AttachFile from './Files/AttachFile';
import StopButton from './StopButton';
import SendButton from './SendButton';
import FileRow from './Files/FileRow';
import Textarea from './Textarea';
import store from '~/store';
import { useForm, SubmitHandler } from 'react-hook-form';
import React from 'react';

type Inputs = {
  text: string;
};

export default function ChatForm({ index = 0 }) {
  const { handleSubmit, getValues, setValue } = useForm<Inputs>({
    defaultValues: { text: '' },
  });

  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit: SubmitHandler<Inputs> = (_data) => {
    submitMessage();
  };

  const [showStopButton, setShowStopButton] = useRecoilState(store.showStopButtonByIndex(index));

  const {
    ask,
    files,
    setFiles,
    conversation,
    isSubmitting,
    handleStopGenerating,
    filesLoading,
    setFilesLoading,
  } = useChatContext();

  const submitMessage = () => {
    const text = getValues('text');
    ask({ text });
    setValue('text', '');
    textAreaRef.current?.setRangeText('', 0, text.length, 'end');
  };

  const { requiresKey } = useRequiresKey();
  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: null };
  const endpoint = endpointType ?? _endpoint;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
    >
      <div className="relative flex h-full flex-1 items-stretch md:flex-col">
        <div className="flex w-full items-center">
          <div className="[&:has(textarea:focus)]:border-token-border-xheavy dark:border-token-border-medium border-token-border-medium bg-token-main-surface-primary relative flex w-full flex-grow flex-col overflow-hidden rounded-2xl border dark:text-white [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)]">
            <FileRow
              files={files}
              setFiles={setFiles}
              setFilesLoading={setFilesLoading}
              Wrapper={({ children }) => (
                <div className="mx-2 mt-2 flex flex-wrap gap-2 px-2.5 md:pl-0 md:pr-4">
                  {children}
                </div>
              )}
            />
            {endpoint && (
              <Textarea
                disabled={requiresKey ?? false}
                onChange={(e) => setValue('text', e.target.value)}
                submitMessage={submitMessage}
                endpoint={_endpoint}
                endpointType={endpointType}
                ref={textAreaRef}
              />
            )}
            <AttachFile
              endpoint={_endpoint ?? ''}
              endpointType={endpointType}
              disabled={requiresKey}
            />
            {isSubmitting && showStopButton ? (
              <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
            ) : (
              endpoint && <SendButton disabled={filesLoading || isSubmitting || requiresKey} />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
