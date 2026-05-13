import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  useGames,
  useGameSessions,
  useCreateGame,
  useUpdateGame,
} from "../hooks/use-games";
import {
  MdInfo,
  MdCalendarMonth,
  MdAdd,
  MdClose,
  MdRocketLaunch,
} from "react-icons/md";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "../components/ui/select";
import { toast } from "sonner";

import type { Game, Session } from "../types/game";

interface SessionInput {
  id?: string;
  title: string;
  type: string;
  entryFee: number;
  maxPlayers?: number;
  winnersCount: number;
  startTime: string;
  endTime: string;
  status?: string;
}

interface PowerUpDef {
  id: string;
  label: string;
  cost: number;
}

interface BundlePack {
  id: string;
  label: string;
  description: string;
  cost: number;
  grants: Record<string, number>;
}

interface GameCapabilities {
  powerUps: boolean;
  bundles: boolean;
  rivalBanner: boolean;
  powerUpDefs: PowerUpDef[];
  bundlePacks: BundlePack[];
}

const DEFAULT_CAPABILITIES: GameCapabilities = {
  powerUps: false,
  bundles: false,
  rivalBanner: false,
  powerUpDefs: [],
  bundlePacks: [],
};

interface GameFormData {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  mode: string;
  thumbnailUrl: string;
  iframeUrl: string;
  durationInSeconds?: number;
  platformFeePercentage: number;
  controls: string;
  rules: string;
  scoring: string;
}

// Helper to get today's date in YYYY-MM-DDTHH:mm format for datetime-local input
const getTodayDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const CreateGame: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const isEditMode = !!slug;
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [capabilities, setCapabilities] =
    useState<GameCapabilities>(DEFAULT_CAPABILITIES);

  const { data: gamesData } = useGames();
  const { data: existingSessionsData } = useGameSessions(gameId || "");

  const createGameMutation = useCreateGame();
  const updateGameMutation = useUpdateGame();

  // Form State
  const [formData, setFormData] = useState<GameFormData>({
    title: "",
    slug: "",
    category: "Puzzle",
    difficulty: "Intermediate",
    mode: "", // None selected by default
    durationInSeconds: 0,
    platformFeePercentage: 10,
    iframeUrl: "",
    thumbnailUrl: "",
    controls: "",
    rules: "",
    scoring: "",
  });

  // Capabilities helpers
  const setCap = <K extends keyof GameCapabilities>(
    key: K,
    val: GameCapabilities[K],
  ) => setCapabilities((prev) => ({ ...prev, [key]: val }));

  const addPowerUp = () =>
    setCap("powerUpDefs", [
      ...capabilities.powerUpDefs,
      { id: "", label: "", cost: 5 },
    ]);
  const removePowerUp = (i: number) =>
    setCap(
      "powerUpDefs",
      capabilities.powerUpDefs.filter((_, idx) => idx !== i),
    );
  const updatePowerUp = (
    i: number,
    field: keyof PowerUpDef,
    val: string | number,
  ) =>
    setCap(
      "powerUpDefs",
      capabilities.powerUpDefs.map((p, idx) =>
        idx === i ? { ...p, [field]: val } : p,
      ),
    );

  const addBundle = () =>
    setCap("bundlePacks", [
      ...capabilities.bundlePacks,
      { id: "", label: "", description: "", cost: 20, grants: {} },
    ]);
  const removeBundle = (i: number) =>
    setCap(
      "bundlePacks",
      capabilities.bundlePacks.filter((_, idx) => idx !== i),
    );
  const updateBundle = (
    i: number,
    field: keyof BundlePack,
    val: string | number | Record<string, number>,
  ) =>
    setCap(
      "bundlePacks",
      capabilities.bundlePacks.map((b, idx) =>
        idx === i ? { ...b, [field]: val } : b,
      ),
    );

  const [sessions, setSessions] = useState<SessionInput[]>([
    {
      title: "Elite Tournament #1",
      type: "tournament",
      entryFee: 1000,
      maxPlayers: 0,
      winnersCount: 0,
      startTime: getTodayDateTime(),
      endTime: new Date(
        new Date().getTime() +
          3 * 60 * 60 * 1000 -
          new Date().getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16), // 3 hours from now
    },
  ]);

  // Populate form if in edit mode
  useEffect(() => {
    if (isEditMode && gamesData?.games) {
      const game = (gamesData.games as Game[]).find((g) => g.slug === slug);
      if (game) {
        setGameId(game.id);
        setIsActive(game.is_active ?? game.isActive ?? true);
        setFormData({
          title: game.title,
          slug: game.slug,
          category: game.category,
          difficulty: game.difficulty,
          mode: game.mode,
          durationInSeconds:
            game.duration_seconds !== undefined ? game.duration_seconds : (game.durationInSeconds || 0),
          platformFeePercentage:
            game.platform_fee_percentage || game.platformFeePercentage || 10,
          iframeUrl: game.iframe_url || game.iframeUrl || "",
          thumbnailUrl: game.thumbnail_url || game.thumbnail,
          controls:
            game.controls ||
            game.howToPlay?.controls ||
            game.how_to_play?.controls ||
            "",
          rules:
            game.rules ||
            game.howToPlay?.rules ||
            game.how_to_play?.rules ||
            "",
          scoring:
            game.scoring ||
            game.howToPlay?.scoring ||
            game.how_to_play?.scoring ||
            "",
        });
        // Restore saved capabilities from DB
        if (game.capabilities) {
          setCapabilities({ ...DEFAULT_CAPABILITIES, ...game.capabilities });
        }
      }
    }
  }, [isEditMode, gamesData, slug]);

  useEffect(() => {
    if (isEditMode && existingSessionsData?.sessions) {
      const mappedSessions = (existingSessionsData.sessions as Session[]).map(
        (s) => ({
          title: s.title,
          type: s.type,
          entryFee: s.entry_fee || 0,
          maxPlayers: s.max_players || 0,
          winnersCount: s.winners_count !== undefined ? s.winners_count : 0,
          startTime: new Date(
            new Date(s.start_time || Date.now()).getTime() -
              new Date().getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16),
          endTime: new Date(
            new Date(s.end_time || Date.now()).getTime() -
              new Date().getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16),
          id: s.id,
          status: s.status,
        }),
      );
      if (mappedSessions.length > 0) {
        setSessions(mappedSessions);
      }
    }
  }, [isEditMode, existingSessionsData]);

  const categories = [
    {
      label: "Competitive",
      items: [
        "Battle Royale",
        "MOBA",
        "Strategy",
        "Shooter (FPS/TPS)",
        "Fighting",
      ],
    },
    { label: "Racing & Sports", items: ["Racing", "Sports", "Simulation"] },
    {
      label: "Casual & Arcade",
      items: ["Arcade", "Retro", "Puzzle", "Trivia", "Card Games"],
    },
    { label: "Adventure", items: ["Adventure", "Role Playing (RPG)"] },
  ];

  const difficulties = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Pro Circuit",
    "Legendary",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSessionChange = (
    index: number,
    field: keyof SessionInput,
    value: string | number | undefined,
  ) => {
    const newSessions = [...sessions];
    newSessions[index] = {
      ...newSessions[index],
      [field]: value,
    } as SessionInput;
    setSessions(newSessions);
  };

  const addSession = () => {
    setSessions([
      {
        title: `Tournament #${sessions.length + 1}`,
        type: "tournament",
        entryFee: 1000,
        maxPlayers: 0,
        winnersCount: 0,
        startTime: getTodayDateTime(),
        endTime: new Date(
          new Date().getTime() +
            3 * 60 * 60 * 1000 -
            new Date().getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16),
      },
      ...sessions,
    ]);
  };

  const duplicateSession = () => {
    const targetSession = sessions[0];
    if (!targetSession) return;

    // Auto-calculate next day's timing if dates exist
    let newStart = "";
    let newEnd = "";

    if (targetSession.startTime && targetSession.endTime) {
      const start = new Date(targetSession.startTime);
      const end = new Date(targetSession.endTime);
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);

      // Format to YYYY-MM-DDTHH:mm for datetime-local input
      newStart = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      newEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }

    setSessions([
      {
        ...targetSession,
        id: undefined,
        status: undefined,
        title: `${targetSession.title} (Clone)`,
        startTime: newStart,
        endTime: newEnd,
      },
      ...sessions,
    ]);
  };

  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom Validation
    if (!formData.mode) {
      toast.error("Please select a game mode");
      return;
    }

    if (formData.mode !== "Head to Head" && !formData.iframeUrl) {
      toast.error("Iframe URL is required for this game mode");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        gameData: {
          ...formData,
          isActive,
          howToPlay: {
            controls: formData.controls,
            rules: formData.rules,
            scoring: formData.scoring,
          },
          durationInSeconds: formData.durationInSeconds
            ? Number(formData.durationInSeconds)
            : 0,
          platformFeePercentage: Number(formData.platformFeePercentage || 10),
          capabilities, // jsonb column — stored as-is in Supabase
        },
        sessions: ["Tournament", "Arena"].includes(formData.mode) ? sessions.map((s) => {
          const startTime = s.startTime
            ? new Date(s.startTime).toISOString()
            : new Date().toISOString();
          const endTime = s.endTime
            ? new Date(s.endTime).toISOString()
            : new Date(Date.now() + 3 * 3600000).toISOString();

          return {
            ...s,
            entryFee: Number(s.entryFee || 0),
            maxPlayers: Number(s.maxPlayers || 0),
            winnersCount: Number(s.winnersCount || 1),
            startTime,
            endTime,
          };
        }) : [],
      };

      if (isEditMode && gameId) {
        await updateGameMutation.mutateAsync({
          gameId,
          gameData: payload.gameData,
          sessions: payload.sessions,
        });
        toast.success("Game updated successfully!");
      } else {
        await createGameMutation.mutateAsync({
          gameData: payload.gameData,
          sessions: payload.sessions,
        });
        toast.success("Game and sessions published successfully!");
      }

      navigate("/games");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error publishing game:", error);
      toast.error(error.response?.data?.message || "Server error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-4 space-y-4">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/30">
              <MdRocketLaunch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {isEditMode ? "Edit Game" : "Publish Game"}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {isEditMode
                  ? "Modify existing game configuration"
                  : "Define a new game listing and configure mechanics"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/games")}
              className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              form="create-game-form"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Publishing..."
                : isEditMode
                  ? "Save Changes"
                  : "Initialize Game"}
            </button>
          </div>
        </div>

        <form
          id="create-game-form"
          onSubmit={handleSubmit}
          className="space-y-8 pb-20"
        >
          {/* Section 1: Game Details */}
          <section className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MdInfo className="text-primary text-lg" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Core Metadata
              </h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="h-11 bg-muted border-border rounded-xl font-bold font-heading"
                    placeholder="e.g. Cyber Strikers"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Identifier Slug <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="h-11 bg-muted border-border rounded-xl font-bold lowercase"
                    placeholder="velocity-gl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleSelectChange("category", v)}
                  >
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((group, i) => (
                        <React.Fragment key={group.label}>
                          <SelectGroup>
                            <SelectLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1">
                              {group.label}
                            </SelectLabel>
                            {group.items.map((item) => (
                              <SelectItem
                                key={item}
                                value={item}
                                className="text-xs font-bold"
                              >
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          {i < categories.length - 1 && <SelectSeparator />}
                        </React.Fragment>
                      ))}
                      {formData.category && !categories.flatMap(g => g.items).includes(formData.category) && (
                        <SelectItem value={formData.category} className="text-xs font-bold">
                          {formData.category} (Legacy)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Difficulty
                  </label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => handleSelectChange("difficulty", v)}
                  >
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {difficulties.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="text-xs font-bold"
                        >
                          {item}
                        </SelectItem>
                      ))}
                      {formData.difficulty && !difficulties.includes(formData.difficulty) && (
                        <SelectItem value={formData.difficulty} className="text-xs font-bold">
                          {formData.difficulty} (Legacy)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Mode <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.mode}
                    onValueChange={(v) => handleSelectChange("mode", v)}
                  >
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Tournament / Quick Match" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Arena" className="text-xs font-bold">
                        Arena (Leaderboard)
                      </SelectItem>
                      <SelectItem
                        value="Tournament"
                        className="text-xs font-bold"
                      >
                        Tournament
                      </SelectItem>
                      <SelectItem
                        value="Solo Earn"
                        className="text-xs font-bold"
                      >
                        Solo Earn
                      </SelectItem>
                      <SelectItem
                        value="Head to Head"
                        className="text-xs font-bold"
                      >
                        Head to Head (H2H)
                      </SelectItem>
                      {formData.mode && !["Arena", "Tournament", "Solo Earn", "Head to Head"].includes(formData.mode) && (
                        <SelectItem value={formData.mode} className="text-xs font-bold">
                          {formData.mode} (Legacy)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Duration (Seconds)
                  </label>
                  <Input
                    name="durationInSeconds"
                    type="number"
                    value={formData.durationInSeconds || ""}
                    onChange={handleInputChange}
                    className="h-11 bg-muted border-border rounded-xl font-bold font-number"
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Platform Fee (%) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="platformFeePercentage"
                    type="number"
                    required
                    value={formData.platformFeePercentage}
                    onChange={handleInputChange}
                    className="h-11 bg-muted border-border rounded-xl font-bold font-number"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Iframe URL{" "}
                    {formData.mode !== "Head to Head" && (
                      <span className="text-rose-500">*</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="iframeUrl"
                      required={formData.mode !== "Head to Head"}
                      value={formData.iframeUrl}
                      onChange={handleInputChange}
                      className="h-11 bg-muted border-border rounded-xl font-bold text-xs flex-1"
                      placeholder={
                        formData.mode === "Head to Head"
                          ? "Not required for internal H2H games"
                          : "https://cdn.playza.com/gameLib/VelocityGL/index.html"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => window.open(formData.iframeUrl, '_blank')}
                      disabled={!formData.iframeUrl}
                      className="px-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 disabled:opacity-30 flex items-center gap-2 h-11"
                    >
                      <MdRocketLaunch className="text-lg" />
                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Launch Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Column: Media & Toggle */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    Thumbnail URL
                  </label>
                  <Input
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    className="h-11 bg-muted border-border rounded-xl"
                    placeholder="https://cdn.playza.com/games/velocity-gl.png"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground font-heading">
                      Active Status
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">
                      Visible to Users
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? "translate-x-5" : "translate-x-0"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            {/* How To Play */}
            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {(
                [
                  {
                    name: "controls",
                    label: "Controls",
                    placeholder: "Use WASD or Arrow Keys...",
                  },
                  {
                    name: "rules",
                    label: "Rules",
                    placeholder: "Win conditions, disqualifications...",
                  },
                  {
                    name: "scoring",
                    label: "Scoring",
                    placeholder: "How points are awarded...",
                  },
                ] as const
              ).map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                    {item.label}
                  </label>
                  <textarea
                    name={item.name}
                    required
                    rows={3}
                    value={formData[item.name as keyof GameFormData] as string}
                    onChange={handleInputChange}
                    className="w-full bg-muted border border-border rounded-xl p-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none text-foreground"
                    placeholder={item.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Game Capabilities */}
          <section className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-primary text-lg">⚡</span>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Game Capabilities
              </h3>
              <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Stored as JSONB in Supabase
              </span>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    key: "powerUps",
                    label: "Power-Ups",
                    sub: "In-game purchasable actions",
                  },
                  {
                    key: "bundles",
                    label: "Bundle Packs",
                    sub: "Pre-session power pack shop",
                  },
                  {
                    key: "rivalBanner",
                    label: "Live Rival Banner",
                    sub: "Real-time opponent score HUD",
                  },
                ] as const
              ).map(({ key, label, sub }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border"
                >
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                      {sub}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCap(key, !capabilities[key])}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      capabilities[key]
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        capabilities[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Power-Up Definitions */}
            {capabilities.powerUps && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Power-Up Definitions
                  </p>
                  <button
                    type="button"
                    onClick={addPowerUp}
                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/20 transition-all"
                  >
                    <MdAdd className="inline" /> Add
                  </button>
                </div>
                {capabilities.powerUpDefs.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic pl-1">
                    No power-ups defined. Click Add to create one.
                  </p>
                )}
                {capabilities.powerUpDefs.map((pu, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-2 items-center bg-muted/40 rounded-xl p-3 border border-border"
                  >
                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        ID (slug)
                      </label>
                      <Input
                        value={pu.id}
                        onChange={(e) => updatePowerUp(i, "id", e.target.value)}
                        className="h-9 bg-muted border-border rounded-lg text-xs font-bold lowercase"
                        placeholder="undo"
                      />
                    </div>
                    <div className="col-span-5 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Label
                      </label>
                      <Input
                        value={pu.label}
                        onChange={(e) =>
                          updatePowerUp(i, "label", e.target.value)
                        }
                        className="h-9 bg-muted border-border rounded-lg text-xs font-bold"
                        placeholder="↩ Undo"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Cost (ZA)
                      </label>
                      <Input
                        type="number"
                        value={pu.cost}
                        onChange={(e) =>
                          updatePowerUp(i, "cost", Number(e.target.value))
                        }
                        className="h-9 bg-muted border-border rounded-lg text-xs font-black text-emerald-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removePowerUp(i)}
                        className="h-9 w-9 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg flex items-center justify-center transition-all"
                      >
                        <MdClose />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bundle Pack Definitions */}
            {capabilities.powerUps && capabilities.bundles && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Bundle Packs
                  </p>
                  <button
                    type="button"
                    onClick={addBundle}
                    className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/20 transition-all"
                  >
                    <MdAdd className="inline" /> Add Pack
                  </button>
                </div>
                {capabilities.bundlePacks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic pl-1">
                    No bundle packs defined yet.
                  </p>
                )}
                {capabilities.bundlePacks.map((pack, i) => (
                  <div
                    key={i}
                    className="bg-muted/40 rounded-xl p-3 border border-border space-y-3"
                  >
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          ID
                        </label>
                        <Input
                          value={pack.id}
                          onChange={(e) =>
                            updateBundle(i, "id", e.target.value)
                          }
                          className="h-9 bg-muted border-border rounded-lg text-xs font-bold lowercase"
                          placeholder="starter"
                        />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Label
                        </label>
                        <Input
                          value={pack.label}
                          onChange={(e) =>
                            updateBundle(i, "label", e.target.value)
                          }
                          className="h-9 bg-muted border-border rounded-lg text-xs font-bold"
                          placeholder="⚡ Starter Pack"
                        />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Description
                        </label>
                        <Input
                          value={pack.description}
                          onChange={(e) =>
                            updateBundle(i, "description", e.target.value)
                          }
                          className="h-9 bg-muted border-border rounded-lg text-xs"
                          placeholder="3× Undo"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          ZA
                        </label>
                        <Input
                          type="number"
                          value={pack.cost}
                          onChange={(e) =>
                            updateBundle(i, "cost", Number(e.target.value))
                          }
                          className="h-9 bg-muted border-border rounded-lg text-xs font-black text-emerald-500"
                        />
                      </div>
                      <div className="col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeBundle(i)}
                          className="h-9 w-9 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg flex items-center justify-center"
                        >
                          <MdClose />
                        </button>
                      </div>
                    </div>
                    {/* Grants: how many of each power-up the pack gives */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Grants (power-up ID → quantity)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {capabilities.powerUpDefs.map((pu) => (
                          <div
                            key={pu.id}
                            className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1"
                          >
                            <span className="text-[10px] font-black text-foreground">
                              {pu.label || pu.id}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              ×
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={pack.grants[pu.id] || 0}
                              onChange={(e) =>
                                updateBundle(i, "grants", {
                                  ...pack.grants,
                                  [pu.id]: Number(e.target.value),
                                })
                              }
                              className="w-10 h-6 bg-background border border-border rounded text-center text-xs font-black text-emerald-500 focus:outline-none"
                            />
                          </div>
                        ))}
                        {capabilities.powerUpDefs.length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Define power-ups first to set grants.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Sessions Setup (Conditional) */}
          {(formData.mode === "Tournament" || formData.mode === "Arena") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MdCalendarMonth className="text-primary text-xl" />
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                    Match Sessions
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={duplicateSession}
                    type="button"
                    className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border border-primary/20"
                  >
                    <MdAdd className="text-lg mr-1 inline" /> Clone Previous
                  </button>
                  <button
                    onClick={addSession}
                    type="button"
                    className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border"
                  >
                    <MdAdd className="text-lg mr-1 inline" /> Add Session
                  </button>
                </div>
              </div>

              {sessions.map((session, idx) => {
                const isLocked = ['active', 'completed', 'finished'].includes(session.status || '');
                return (
                <div
                  key={idx}
                  className={`bg-card border border-border rounded-2xl p-6 shadow-sm relative ${isLocked ? 'opacity-80' : ''}`}
                >
                  {!isLocked && (
                  <button
                    onClick={() => removeSession(idx)}
                    className="absolute -top-2 -right-2 h-8 w-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-600 transition-all z-10"
                    type="button"
                  >
                    <MdClose className="text-lg" />
                  </button>
                  )}
                  {isLocked && (
                    <div className="absolute -top-3 right-4 px-2 py-1 bg-amber-500 text-white rounded text-[10px] font-bold uppercase shadow-sm">
                      Locked ({session.status})
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Session Title
                      </label>
                      <Input
                        disabled={isLocked}
                        className="h-11 bg-muted border-border rounded-xl font-bold uppercase tracking-tight"
                        placeholder="Elite Tournament #1"
                        value={session.title}
                        onChange={(e) =>
                          handleSessionChange(idx, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Type
                      </label>
                      <Select
                        disabled={isLocked}
                        value={session.type}
                        onValueChange={(v) =>
                          handleSessionChange(idx, "type", v)
                        }
                      >
                        <SelectTrigger className="h-11 bg-muted border-border rounded-xl font-bold text-xs uppercase">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem
                            value="tournament"
                            className="text-xs font-bold"
                          >
                            Tournament
                          </SelectItem>
                          <SelectItem
                            value="daily"
                            className="text-xs font-bold"
                          >
                            Daily
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Entry Fee
                      </label>
                      <Input
                        type="number"
                        disabled={isLocked}
                        className="h-11 bg-muted border-border rounded-xl font-black text-emerald-600 font-number"
                        value={session.entryFee}
                        onChange={(e) =>
                          handleSessionChange(
                            idx,
                            "entryFee",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Max Players
                        </label>
                        <Input
                          type="number"
                          disabled={isLocked}
                          className="h-11 bg-muted border-border rounded-xl font-black font-number"
                          value={session.maxPlayers || ""}
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "maxPlayers",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Winners
                        </label>
                        <Input
                          type="number"
                          disabled={isLocked}
                          className="h-11 bg-muted border-border rounded-xl font-black font-number"
                          value={session.winnersCount}
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "winnersCount",
                              Number(e.target.value),
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Start
                        </label>
                        <Input
                          type="datetime-local"
                          disabled={isLocked}
                          className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase scheme-dark md:scheme-light dark:scheme-dark"
                          value={session.startTime}
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "startTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          End
                        </label>
                        <Input
                          type="datetime-local"
                          disabled={isLocked}
                          className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase scheme-dark md:scheme-light dark:scheme-dark"
                          value={session.endTime}
                          onChange={(e) =>
                            handleSessionChange(idx, "endTime", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {/* Dynamic Prize Note */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide italic">
                      Note: Prize pool and platform fees are calculated
                      dynamically based on actual entries.
                    </p>
                  </div>
                </div>
                );
              })}
            </section>
          )}

          {/* Final Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
            <div className="flex flex-col w-full lg:w-auto">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">
                Platform Revenue
              </span>
              <span className="text-2xl font-black text-emerald-500 tracking-tight uppercase font-number">
                {formData.platformFeePercentage}% Service Fee
              </span>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-border bg-card text-foreground hover:bg-muted transition-all"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 lg:flex-none px-10 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group disabled:opacity-50"
              >
                <MdRocketLaunch className="text-lg" />
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Publishing..."
                  : isEditMode
                    ? "Update Game"
                    : "Publish Game"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateGame;
