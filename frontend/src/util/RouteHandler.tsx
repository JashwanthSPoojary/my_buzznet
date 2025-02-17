import React, { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useChannelStore, useMemberStore, useWorkspaceStore } from "../stores";

const RouteHandler = () => {
  const location = useLocation();
  const { setSelectedWorkspace, workspaces } = useWorkspaceStore();
  const { channels, setSelectedChannel } = useChannelStore();
  const { members,setSelectedMember } = useMemberStore();
  const prevWorkspace = useRef<number | undefined>(undefined);
  const prevChannel = useRef<number | undefined>(undefined);
  const prevMember = useRef<number | undefined>(undefined);
  const path = location.pathname;
  const match = useMemo(
    () => path.match(/\/workspaces\/(\d+)(?:\/channels\/(\d+)|\/dms\/(\d+))?/),
    [path]
  );
  const workspaceExists = useMemo(
    () => new Set(workspaces.map((w) => w.id)),
    [workspaces]
  );
  const channelExists = useMemo(
    () => new Set(channels.map((c) => c.id)),
    [channels]
  );
  const memberExists = useMemo(
    () => new Set(members.map((c) => c.id)),
    [members]
  );
  useEffect(() => {
    if (!match) {
      console.warn("RouteHandler: Invalid URL structure");
      setSelectedWorkspace(undefined);
      setSelectedChannel(undefined);
      setSelectedMember(undefined);
      return;
    }

    const workspaceId = match ? parseInt(match[1], 10) : undefined;
    const channelId = match && match[2] ? parseInt(match[2], 10) : undefined;
    const dmId = match && match[3] ? parseInt(match[3], 10) : undefined;
    const updateState = (
      id: number | undefined,
      exists: Set<number>,
      setFunction: (id: number) => void,
      prevRef: React.MutableRefObject<number | undefined>
    ) => {
      if (id !== prevRef.current && id !== undefined && exists.has(id)) {
        setFunction(id);
        prevRef.current = id;
      }
    };
    updateState(
      workspaceId,
      workspaceExists,
      setSelectedWorkspace,
      prevWorkspace
    );
    updateState(channelId, channelExists, setSelectedChannel, prevChannel);
    updateState(dmId,memberExists,setSelectedMember,prevMember);
  }, [
    match,
    workspaceExists,
    channelExists,
    setSelectedWorkspace,
    setSelectedChannel,
    memberExists,
    setSelectedMember
  ]);

  return null;
};

export default RouteHandler;
