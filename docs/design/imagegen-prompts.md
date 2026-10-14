# 基础模块概念图生成记录

工具：内置 `image_gen`，未使用CLI或外部API密钥。概念图用于版式、配色、字体与图标方向；实际资源中的机械图示是依据计算模型重新绘制的可交互SVG。

## 手机建模状态

输出：`foundation-mobile-concept.png`。无参考输入图，重新生成。

```text
Use case: ui-mockup. Generate one NEW original complete mobile educational H5 webpage screenshot, flat edge-to-edge page, no phone frame, approximately 9:16 portrait. This is a Chinese undergraduate mechanics interactive micro-lesson. Absolutely no resemblance to an old generic React laboratory with purple/blue cards. Art direction: premium textbook editorial design, pure white background #FFFFFF, deep pine ink #153B35, muted gray-green #6B7C75, restrained burnt orange #D86A3B for external force. Strong readable Chinese sans-serif typography, generous clear spacing, technical illustration as focus, no gradients, no frosted panels, no bento dashboard, no decorative badges above heading. The entire compact main learning screen must be visible from header to footer, readable code-implementable elements.

Exact UI layout: small header wordmark '力学微实验' on left with a bespoke vector-style tiny cut-specimen symbol, thin reset-arrow button on right. Below it a five-step lesson navigation in ONE horizontal rail with labels '建模' '内力' '应力' '应变' '材料', first item active by a dark-green underline. Main heading '先把真实试件，变成可计算的模型。' on two lines, supporting sentence '从一根受拉试件出发，理解力、面积、变形和材料之间的关系。'. Main large unframed engineering illustration on a very lightly sage-tinted canvas (#F3F6F1): a long 3D rectangular metal test specimen, orange arrows pulling outward at both ends marked 'F', subtle measurement ruler below marked 'L₀ = 200 mm', a magnified circular callout highlighting the tiny material grain texture (illustrating continuum idealization). Labels should be large and few. Under canvas a single flat inline comparison control '真实试件' | '理想模型', ideal model selected dark green. One short observation sentence '忽略微观颗粒，把材料看作连续、均匀的整体。'. Below a thin horizontal divider, a heading '这个简化，保留了什么？', two full-width answer rows with bespoke outline selection-circle icons: '外形、尺寸与受力条件' and '每一颗晶粒的细节'. Small footer statement '本节采用均匀杆、轴向载荷与小变形假设。' and a dark-green bottom primary button '下一步：切开看内力 →'. Functional five steps and quiz, no extra nav, metrics, marketing claims, AI assistant, textbook copied graphics, or login. Produce bespoke consistent vector icon shapes and elegant original schematic illustration. All text/controls are to be recreated in HTML/CSS, mechanical illustration in custom SVG for actual interaction; no decorative raster picture required. Use accurate, clear Chinese text and realistic HTML/CSS-feasible spacing. This image is the COMPLETE mobile primary state spec, not a hero or mood board.
```

## 桌面应力状态与科学图示修订

以手机概念图为视觉参考生成桌面应力状态，再修正受力方向。最终输出：`foundation-stress-concept.png`。

桌面生成提示的内容约束：

```text
Use case ui-mockup. The attached mobile screenshot is STYLE REFERENCE ONLY, do not reproduce its mobile dimensions or first lesson. Create a NEW complete desktop webpage screenshot of the SAME original Chinese mechanics micro-lesson app, active lesson '应力'. Landscape about 3:2, full primary screen including quiz and footer. Pure white #FFFFFF, deep pine ink #153B35, muted sage #F3F6F1, burnt orange #D86A3B. Exact matching typography, bespoke specimen logo and outline reset symbol from style reference. Code-native text and controls, custom SVG diagrams to implement, no imported old assets. No gradients except tiny diagram metal shading, no dashboard cards or marketing banners.

Layout: max-width centered editorial app; top header '力学微实验' and reset icon right. Beneath full-width five-step progress rail '建模' '内力' '应力' '应变' '材料' with '应力' active. Main heading '同样的拉力，为什么细杆更吃力？' large bold dark green, subtext '拉力相同，承受它的面积不同。应力描述单位面积上的内力。'. Two-column learning workspace: left about 62% width a large soft sage scientific canvas showing two frontal square cross-sections side by side, left fixed reference area A₀=100 mm² right current area A=200 mm²; right square side length sqrt(2) times left. Nine small uniformly distributed orange force dots on each face, black/green fine technical outline and simple dimension markings. '同一拉力 F = 6.0 kN' label above, σ₀=60 MPa and σ=30 MPa below. The diagram must remain schematic, not an elaborate render. Right about 38% column with two clean labeled horizontal sliders '拉力 F' value '6.0 kN' min '1' max '12', '截面积 A' value '200 mm²' min '50' max '300', deep green tracks and circular outlined knobs, then a large math expression 'σ = F / A' and result '30.0 MPa', a short explanatory observation '面积加倍，同一拉力下应力减半。'. Below workspace separated by thin rule, quiz heading '如果截面积再增大，应力会怎样？' and two outline full-width radio answer rows on right '减小' '增大' or equal-width horizontal desktop rows. Footer states '采用均匀轴向拉力；σ 为截面平均正应力。' and one right-aligned dark-green next button '下一步：分清位移与应变 →'. Main task interface restrained and generous, no AI assistant, no side nav, no old blue/purple experiment cards, no extra tabs beyond lesson rail. All content legible and implementable; this is a full screen state reference with controls and quiz.
```

修订提示：

```text
Edit this desktop interface screenshot ONLY to correct the physical interpretation of its cross-section diagram and match the intended quiz. Keep EXACTLY the entire layout, white background, pine-green typography, header, five-step rail, sliders, formula/result, spacing, two cross-section sizes, footer, and next button unchanged. In the LEFT scientific canvas, REMOVE all four horizontal orange F arrows positioned beside the two square cross-sections: those in-plane arrows could wrongly suggest force parallel to the section. Keep the nine orange circles on each face, but turn each into the standard out-of-plane symbol ⊙ (orange outlined circle with orange center dot), representing uniform traction pointing OUT of the face toward the reader, normal to the section. Retain header '同一拉力 F = 6.0 kN'. Add a small readable caption within the bottom of the left canvas '⊙ 表示垂直截面向外的拉力分布', with enough space and no overlaps. Keep dimensions and A and σ numerical labels identical. Replace quiz heading with '保持拉力不变，截面积加倍，应力会怎样？' and answer rows text '减为原来的一半' and '增为原来的两倍'. This is a mechanics textbook app: scientific fidelity is essential. No other creative changes or extra objects. Return the full edited desktop screenshot.
```

修订图的生成结果同时改变了主标题，因此实际页面沿用原教学问题“同样的拉力，为什么细杆更吃力？”，判断题则使用“保持拉力不变，截面积加倍，应力会怎样？”，避免将标题和检测问题重复。
