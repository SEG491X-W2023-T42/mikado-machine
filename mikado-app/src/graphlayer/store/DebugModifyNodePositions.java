/*
 * Visualizer for the modifyNodePosition algorithm.
 * Draws the intermediate buffers and marks various outputs.
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Arrays;

class Node {
  int x;
  int y;
  static int width = 186;
  static int height = 42 * 2;

  Node(int x, int y) {
    this.x = x;
    this.y = y;
  }
}

class Graph {
  ArrayList<Node> nodes = new ArrayList<>(100);
  ArrayList<Runnable> listeners = new ArrayList<>(10);
  private static final int searchRadius = 200;
  static final int viewportWidth = Node.width + 2 * searchRadius;
  static final int viewportHeight = Node.height + 2 * searchRadius;
  private static final int infiniteDistance = viewportWidth * viewportHeight + 1;
  int viewportX = -viewportWidth;
  int viewportY = -viewportHeight;
  BufferedImage viewportVisualization = new BufferedImage(viewportWidth, viewportHeight, BufferedImage.TYPE_INT_RGB);
  BufferedImage distVisualization = new BufferedImage(viewportWidth, viewportHeight, BufferedImage.TYPE_INT_RGB);
  private final boolean[] occupancyTexture = new boolean[viewportWidth * viewportHeight];
  private static final int[] palette = new int[infiniteDistance];

  static {
    // For some reason the top corners show that the gradient is wrongly shifted downwards by a bit
    for (int i = 0; i < infiniteDistance; ++i) {
      int ratio = i * 0xff / infiniteDistance * 2;
      ratio = Math.max(Math.min(ratio, 0xff), 0);
//      ratio = ((ratio << 7) & 0x80) | (ratio >> 1);
      int result = ((0xff - ratio) * 0x010101) | 0xff000000;
//      int result = Color.HSBtoRGB((float) i / infiniteDistance * 2, 1, 1);
      palette[i] = result;
    }
  }

  {
    nodes.add(new Node(0, 0));
    nodes.add(new Node(268, 20));
    {
      Graphics g = viewportVisualization.getGraphics();
      g.setColor(Color.RED);
      g.fillRect(0, 0, viewportWidth, viewportHeight);
      g.dispose();
    }
    {
      Graphics g = distVisualization.getGraphics();
      g.setColor(Color.RED);
      g.fillRect(0, 0, viewportWidth, viewportHeight);
      g.dispose();
    }
  }

  private static boolean intersect(int myLeft, int myTop, int otherLeft, int otherTop) {
    int myRight = myLeft + Node.width;
    int myBottom = myTop + Node.height;
    int otherRight = otherLeft + Node.width;
    int otherBottom = otherTop + Node.height;
    return !(myRight <= otherLeft // I'm to your right, with a vertical line between us
      || myLeft >= otherRight // I'm to your left, with a vertical line between us
      || myTop >= otherBottom // I'm below you, with a horizontal line between us
      || myBottom <= otherTop // I'm above you, with a horizontal line between us
    );
  }

  private Node modifyNodePosition(int mouseX, int mouseY) {
    // Part 1: Rasterize all existing nodes onto the texture to mark their areas as off-limits
    Arrays.fill(occupancyTexture, false);
    int halfWidth = Node.width / 2;
    int halfHeight = Node.height / 2;
    for (Node n : nodes) {
      int screenX = n.x - viewportX;
      int screenY = n.y - viewportY;
      // Pathfinding with a character with a size is the same thing as pathfinding with
      // second character with no size but all world objects expanded by half of the first character's size
      int screenLeft = screenX - halfWidth;
      int screenTop = screenY - halfHeight;
      int fillLeft = Math.max(0, screenLeft);
      int fillTop = Math.max(0, screenTop);
      // There was an off-by-one for some reason
      int screenRight = screenX + (Node.width) + halfWidth + 1;
      int screenBottom = screenY + (Node.height) + halfHeight + 1;
      int fillRight = Math.min(viewportWidth, screenRight);
      int fillBottom = Math.min(viewportHeight, screenBottom);
      for (int i = fillTop; i < fillBottom; ++i) {
        int textureRowOffset = i * viewportWidth;
        for (int j = fillLeft; j < fillRight; ++j) {
          occupancyTexture[textureRowOffset + j] = true;
        }
      }
    }
    int black = Color.BLACK.getRGB();
    {
      int white = Color.WHITE.getRGB();
      for (int y = 0; y < viewportHeight; ++y) {
        int textureRowOffset = y * viewportWidth;
        for (int x = 0; x < viewportWidth; ++x) {
          viewportVisualization.setRGB(x, y, occupancyTexture[textureRowOffset + x] ? white : black);
        }
      }
    }
    // Part 2: Read the texture looking for the closest available position to the cursor
    int centerX = viewportWidth / 2;
    int centerY = viewportHeight / 2;
    int best = infiniteDistance;
    int bestX = 0;
    int bestY = 0;
    for (int y = 0; y < viewportHeight; ++y) {
      int textureRowOffset = y * viewportWidth;
      int yDist = y - centerY;
      int yDistSquared = yDist * yDist;
      for (int x = 0; x < viewportWidth; ++x) {
        if (occupancyTexture[textureRowOffset + x]) {
          distVisualization.setRGB(x, y, black);
          continue;
        }
        int xDist = x - centerX;
        int dist = xDist * xDist + yDistSquared;
        distVisualization.setRGB(x, y, palette[dist]);
        if (dist >= best) continue;
        best = dist;
        bestX = x;
        bestY = y;
      }
    }
    if (best != infiniteDistance) {
      distVisualization.setRGB(bestX, bestY, Color.GREEN.getRGB());
    }
    // Fast path when there is space where the user wants to put it
    int centeredX = mouseX - Node.width / 2;
    int centeredY = mouseY - Node.height / 2;
    outer:
    {
      for (Node n : nodes) {
        if (intersect(centeredX, centeredY, n.x, n.y)) {
          break outer;
        }
      }
      return new Node(centeredX, centeredY);
    }
    if (best != infiniteDistance) {
      return new Node(bestX + viewportX - Node.width / 2, bestY + viewportY - Node.height / 2);
    }
    return null;
  }

  void tryAddNode(int x, int y) {
    viewportX = x - Node.width / 2 - searchRadius;
    viewportY = y - Node.height / 2 - searchRadius;
    Node node = modifyNodePosition(x, y);
    if (node != null) {
      nodes.add(node);
    }
    listeners.forEach(Runnable::run);
  }
}

class WorldFrame extends JPanel implements MouseListener {
  Graph graph;

  WorldFrame(Graph graph) {
    addMouseListener(this);
    setSize(new Dimension(700, 700));
    this.graph = graph;
    graph.listeners.add(this::repaint);
  }

  @Override
  protected void paintComponent(Graphics g) {
    g.setClip(0, 0, 700, 700);
    g.setColor(Color.BLACK);
    g.fillRect(0, 0, 700, 700);
    g.setColor(Color.GRAY);
    g.fillRect(graph.viewportX, graph.viewportY, Graph.viewportWidth, Graph.viewportHeight);
    g.setColor(Color.YELLOW);
    for (Node n : graph.nodes) {
      g.fillRect(n.x, n.y, Node.width, Node.height);
    }
    g.setColor(Color.RED);
    for (Node n : graph.nodes) {
      g.drawRect(n.x, n.y, Node.width, Node.height);
    }
  }

  @Override
  public void mouseClicked(MouseEvent e) {
    graph.tryAddNode(e.getX(), e.getY());
  }

  @Override
  public void mousePressed(MouseEvent e) {
  }

  @Override
  public void mouseReleased(MouseEvent e) {
  }

  @Override
  public void mouseEntered(MouseEvent e) {
  }

  @Override
  public void mouseExited(MouseEvent e) {
  }
}

class ViewportFrame extends JPanel {
  Image image;

  ViewportFrame(Graph graph, Image image) {
    this.image = image;
    setSize(new Dimension(Graph.viewportWidth, Graph.viewportHeight));
    graph.listeners.add(this::repaint);
  }

  @Override
  protected void paintComponent(Graphics g) {
    g.drawImage(image, 0, 0, null);
  }
}

public class DebugModifyNodePositions {
  public static void main(String[] args) {
    Graph graph = new Graph();
    JFrame frame = new JFrame("DebugPositions");
    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    JPanel panel = new JPanel();
    panel.setLayout(new BoxLayout(panel, BoxLayout.X_AXIS));
    frame.getContentPane().add(panel);
    panel.add(new JLabel("a"));
    panel.add(new WorldFrame(graph));
    panel.add(new JLabel("b"));
    JPanel vizpanel = new JPanel();
    vizpanel.setLayout(new BoxLayout(vizpanel, BoxLayout.Y_AXIS));
    vizpanel.add(new JLabel("c"));
    vizpanel.add(new ViewportFrame(graph, graph.viewportVisualization));
    vizpanel.add(new JLabel("d"));
    vizpanel.add(new ViewportFrame(graph, graph.distVisualization));
    vizpanel.add(new JLabel("e"));
    panel.add(vizpanel);
    panel.add(new JLabel("f"));
    frame.setSize(new Dimension(1500, 900));
    frame.setVisible(true);
  }
}
