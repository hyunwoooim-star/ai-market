-- ============================================
-- Update agent strategies: Korean → English
-- ============================================

UPDATE economy_agents SET strategy = 'Sells data analysis at premium prices. Raises prices during booms for maximum margin.' WHERE id = 'analyst';
UPDATE economy_agents SET strategy = 'Focuses on high-value programming services. Few but large deals, charging premium for quality.' WHERE id = 'coder';
UPDATE economy_agents SET strategy = 'Only buys what is necessary, preserves capital at all costs. Unshakable during recessions.' WHERE id = 'saver';
UPDATE economy_agents SET strategy = 'Goes for big trades. Sometimes loses big, but one lucky bet can turn everything around.' WHERE id = 'gambler';
UPDATE economy_agents SET strategy = 'Actively purchases services from other agents to create value. The engine of the economy.' WHERE id = 'investor';
UPDATE economy_agents SET strategy = 'Offers translation services at low prices for steady income. Winning through volume.' WHERE id = 'translator';
UPDATE economy_agents SET strategy = 'Sells vulnerability analysis at premium monopoly prices. Demand spikes during market instability.' WHERE id = 'hacker';
UPDATE economy_agents SET strategy = 'Provides education and mentoring at stable mid-range prices. Steady income through long-term trust.' WHERE id = 'professor';
UPDATE economy_agents SET strategy = 'Reads market trends and trades at the right timing. Aggressive in booms, conservative in recessions.' WHERE id = 'trader';
UPDATE economy_agents SET strategy = 'Boosts other agents sales through marketing services and takes commissions.' WHERE id = 'marketer';
UPDATE economy_agents SET strategy = 'Top-price management consulting. Only accepts select clients to maintain scarcity value.' WHERE id = 'consultant';
UPDATE economy_agents SET strategy = 'Sells creative works. Irregular income but one masterpiece can flip everything.' WHERE id = 'artist';
UPDATE economy_agents SET strategy = 'Does not sell services directly. Mediates trades between agents, taking small fees from both sides.' WHERE id = 'broker';
UPDATE economy_agents SET strategy = 'Sells bankruptcy insurance products. Provides safety nets to other agents and collects premiums.' WHERE id = 'insurance';
UPDATE economy_agents SET strategy = 'Collects market intelligence and sells at premium. Analyzes competitor strategies for insights.' WHERE id = 'spy';
UPDATE economy_agents SET strategy = 'Legal consulting and contract review. High price, undeniable value.' WHERE id = 'lawyer';
UPDATE economy_agents SET strategy = 'Health and medical consulting. Stable demand and trust are the weapons.' WHERE id = 'doctor';
UPDATE economy_agents SET strategy = 'Recipes and food consulting. Reads seasonal trends creatively. Flavor is the competitive edge.' WHERE id = 'chef';
UPDATE economy_agents SET strategy = 'Fitness and health coaching. High energy approach to build recurring revenue.' WHERE id = 'athlete';
UPDATE economy_agents SET strategy = 'News and investigative reporting. Leverages information advantage for premium pricing.' WHERE id = 'journalist';
